
import "dotenv/config";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

import {
  EmployeeInvitationStatus,
  InvitationDeliveryChannel,
  InvitationDeliveryStatus,
  EmploymentStatus,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { decryptInvitationToken } from "../security/invitation-token-crypto.js";

import { sendEmployeeInvitationEmail } from "../emailService/InvitationEmailService.js";

const LOG_PREFIX = "[INVITATION DELIVERY WORKER]";

const BATCH_SIZE = 10;
const STALE_PROCESSING_MINUTES = 5;
const BASE_RETRY_DELAY_MS = 5_000;
const MAX_RETRY_DELAY_MS = 60 * 60 * 1000;

export class InvitationDeliveryWorker {
  private running = false;

  async processPending(): Promise<void> {
    if (this.running) {
      console.log(
        `${LOG_PREFIX} Previous polling cycle still running; skipping`,
      );
      return;
    }

    this.running = true;

    try {
      await this.recoverStaleJobs();

      const now = new Date();

      console.log(`${LOG_PREFIX} Looking for pending jobs`, {
        batchSize: BATCH_SIZE,
        now: now.toISOString(),
      });

      const jobs = await prisma.invitationDelivery.findMany({
        where: {
          status: InvitationDeliveryStatus.PENDING,
          channel: InvitationDeliveryChannel.EMAIL,
          nextAttemptAt: { lte: now },
        },
        orderBy: { createdAt: "asc" },
        take: BATCH_SIZE,
        select: { id: true },
      });

      console.log(`${LOG_PREFIX} Pending jobs found`, {
        count: jobs.length,
      });

      for (const job of jobs) {
        try {
          await this.processDelivery(job.id);
        } catch (error) {
          // One job must not prevent the rest of the batch
          // from being processed.
          console.error(
            `${LOG_PREFIX} Unexpected job-processing error`,
            {
              deliveryId: job.id,
              error:
                error instanceof Error
                  ? error.message
                  : String(error),
            },
          );
        }
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} Polling cycle failed`, {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    } finally {
      this.running = false;
    }
  }

  private async recoverStaleJobs(): Promise<void> {
    const staleBefore = new Date(
      Date.now() -
        STALE_PROCESSING_MINUTES * 60 * 1000,
    );

    console.log(`${LOG_PREFIX} Recovering stale jobs`, {
      staleBefore: staleBefore.toISOString(),
    });

    const result = await prisma.invitationDelivery.updateMany({
      where: {
        status: InvitationDeliveryStatus.PROCESSING,
        channel: InvitationDeliveryChannel.EMAIL,
        updatedAt: { lt: staleBefore },
      },
      data: {
        status: InvitationDeliveryStatus.PENDING,
        nextAttemptAt: new Date(),
      },
    });

    if (result.count > 0) {
      console.warn(`${LOG_PREFIX} Stale jobs recovered`, {
        count: result.count,
      });
    }
  }

  private async processDelivery(
    deliveryId: string,
  ): Promise<void> {
    console.log(`${LOG_PREFIX} Processing delivery`, {
      deliveryId,
    });

    const delivery = await this.claimDelivery(deliveryId);

    if (!delivery) {
      console.log(`${LOG_PREFIX} Job already claimed or unavailable`, {
        deliveryId,
      });
      return;
    }

    console.log(`${LOG_PREFIX} Job claimed`, {
      deliveryId: delivery.id,
      invitationId: delivery.invitationId,
      attempts: delivery.attempts,
      maxAttempts: delivery.maxAttempts,
    });

    try {
      await this.sendDelivery(delivery);
    } catch (error) {
      console.error(`${LOG_PREFIX} Delivery attempt failed`, {
        deliveryId,
        attempt: delivery.attempts,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });

      await this.recordFailure(delivery.id, error);
    }
  }

  private async claimDelivery(deliveryId: string) {
    const now = new Date();

    // Conditional update makes claiming atomic. Only one
    // worker can transition this job from PENDING.
    const claimed = await prisma.invitationDelivery.updateMany({
      where: {
        id: deliveryId,
        channel: InvitationDeliveryChannel.EMAIL,
        status: InvitationDeliveryStatus.PENDING,
        nextAttemptAt: { lte: now },
      },
      data: {
        status: InvitationDeliveryStatus.PROCESSING,
        attempts: { increment: 1 },
      },
    });

    if (claimed.count !== 1) {
      return null;
    }

    return prisma.invitationDelivery.findUnique({
      where: { id: deliveryId },
    });
  }

  private async sendDelivery(
    delivery: NonNullable<
      Awaited<ReturnType<InvitationDeliveryWorker["claimDelivery"]>>
    >,
  ): Promise<void> {
    console.log(`${LOG_PREFIX} Loading invitation`, {
      deliveryId: delivery.id,
      invitationId: delivery.invitationId,
    });

    const invitation = await prisma.employeeInvitation.findUnique({
      where: { id: delivery.invitationId },
      include: {
        employee: true,
        business: true,
        branch: true,
      },
    });

    const now = new Date();

    if (
      !invitation ||
      invitation.status !== EmployeeInvitationStatus.PENDING ||
      !invitation.expiresAt ||
      invitation.expiresAt <= now ||
      invitation.employee.employmentStatus !== EmploymentStatus.INVITED
    ) {
      console.warn(`${LOG_PREFIX} Invitation is no longer valid`, {
        deliveryId: delivery.id,
        invitationFound: Boolean(invitation),
        invitationStatus: invitation?.status ?? null,
        expired:
          invitation?.expiresAt
            ? invitation.expiresAt <= now
            : true,
        employeeStatus:
          invitation?.employee.employmentStatus ?? null,
      });

      await this.cancelDelivery(delivery.id);
      return;
    }

    if (!delivery.encryptedToken) {
      throw new Error(
        "Delivery job has no encrypted invitation token",
      );
    }

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured");
    }

    console.log(`${LOG_PREFIX} Decrypting invitation token`, {
      deliveryId: delivery.id,
    });

    const rawToken = decryptInvitationToken(
      delivery.encryptedToken,
    );

    const signupUrl = new URL(
      "/employee-signup",
      frontendUrl,
    );

    signupUrl.searchParams.set("token", rawToken);

    console.log(`${LOG_PREFIX} Sending invitation email`, {
      deliveryId: delivery.id,
      recipientPresent: Boolean(delivery.recipient),
      businessNamePresent: Boolean(invitation.business.name),
      branchNamePresent: Boolean(invitation.branch?.name),
    });

    // Always use the persisted recipient, never TEST_EMAIL.
    await sendEmployeeInvitationEmail(
      delivery.recipient,
      {
        employeeName: invitation.employee.fullName,
        businessName: invitation.business.name,
        branchName: invitation.branch?.name ?? null,
        role: invitation.role,
        inviterName: invitation.business.name,
        expiryDate: invitation.expiresAt.toLocaleString(),
        invitationUrl: signupUrl.toString(),
      },
    );

    console.log(`${LOG_PREFIX} Email provider accepted request`, {
      deliveryId: delivery.id,
    });

    // Only mark SENT after the email service succeeds.
    // Clear the encrypted token once the delivery is recorded.
    const updated = await prisma.invitationDelivery.updateMany({
      where: {
        id: delivery.id,
        status: InvitationDeliveryStatus.PROCESSING,
      },
      data: {
        status: InvitationDeliveryStatus.SENT,
        sentAt: new Date(),
        encryptedToken: null,
        lastError: null,
      },
    });

    if (updated.count !== 1) {
      throw new Error(
        "Email was accepted, but delivery status could not be updated",
      );
    }

    console.log(`${LOG_PREFIX} Delivery marked SENT`, {
      deliveryId: delivery.id,
    });
  }

  private async cancelDelivery(
    deliveryId: string,
  ): Promise<void> {
    const result = await prisma.invitationDelivery.updateMany({
      where: {
        id: deliveryId,
        status: InvitationDeliveryStatus.PROCESSING,
      },
      data: {
        status: InvitationDeliveryStatus.CANCELLED,
        encryptedToken: null,
        lastError: "Invitation is invalid, expired, or no longer pending",
      },
    });

    console.log(`${LOG_PREFIX} Delivery cancelled`, {
      deliveryId,
      updated: result.count === 1,
    });
  }

  private async recordFailure(
    deliveryId: string,
    error: unknown,
  ): Promise<void> {
    const delivery = await prisma.invitationDelivery.findUnique({
      where: { id: deliveryId },
      select: {
        id: true,
        attempts: true,
        maxAttempts: true,
        status: true,
      },
    });

    if (
      !delivery ||
      delivery.status !== InvitationDeliveryStatus.PROCESSING
    ) {
      console.warn(`${LOG_PREFIX} Failure record skipped`, {
        deliveryId,
        reason: "Job missing or no longer processing",
      });
      return;
    }

    const errorMessage = (
      error instanceof Error
        ? error.message
        : String(error)
    ).slice(0, 1000);

    if (delivery.attempts >= delivery.maxAttempts) {
      const updated = await prisma.invitationDelivery.updateMany({
        where: {
          id: deliveryId,
          status: InvitationDeliveryStatus.PROCESSING,
        },
        data: {
          status: InvitationDeliveryStatus.FAILED,
          failedAt: new Date(),
          encryptedToken: null,
          lastError: errorMessage,
        },
      });

      console.error(`${LOG_PREFIX} Maximum attempts reached`, {
        deliveryId,
        attempts: delivery.attempts,
        updated: updated.count === 1,
      });

      return;
    }

    const delayMs = Math.min(
      BASE_RETRY_DELAY_MS *
        2 ** Math.max(0, delivery.attempts - 1),
      MAX_RETRY_DELAY_MS,
    );

    const nextAttemptAt = new Date(
      Date.now() + delayMs,
    );

    const updated = await prisma.invitationDelivery.updateMany({
      where: {
        id: deliveryId,
        status: InvitationDeliveryStatus.PROCESSING,
      },
      data: {
        status: InvitationDeliveryStatus.PENDING,
        nextAttemptAt,
        lastError: errorMessage,
      },
    });

    console.warn(`${LOG_PREFIX} Delivery scheduled for retry`, {
      deliveryId,
      attempts: delivery.attempts,
      nextAttemptAt: nextAttemptAt.toISOString(),
      updated: updated.count === 1,
    });
  }
}
