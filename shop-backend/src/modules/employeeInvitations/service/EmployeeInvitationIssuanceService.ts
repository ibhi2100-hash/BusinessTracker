
import {
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";

import {
  EmployeeInvitationStatus,
  InvitationDeliveryChannel,
  InvitationDeliveryStatus,
  EmploymentStatus,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { encryptInvitationToken } from "../security/invitation-token-crypto.js";

type IssueInvitationInput = {
  invitationId: string;
  employeeId: string;
  businessId: string;
  branchId: string | null;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF";
};

const LOG_PREFIX = "[EmployeeInvitationIssuanceService]";

export class EmployeeInvitationIssuanceService {
  async issue(input: IssueInvitationInput) {
    const traceId = randomUUID();
    let step = "INITIALIZATION";

    const log = (
      message: string,
      details?: Record<string, unknown>,
    ) => {
      console.log(`${LOG_PREFIX} [${traceId}] ${message}`, details ?? "");
    };

    const logError = (
      message: string,
      error: unknown,
    ) => {
      console.error(`${LOG_PREFIX} [${traceId}] ${message}`, {
        step,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : String(error),
      });
    };

    log("START: Invitation issuance requested", {
      invitationId: input.invitationId,
      employeeId: input.employeeId,
      businessId: input.businessId,
      branchId: input.branchId,
      role: input.role,
      emailProvided: Boolean(input.email?.trim()),
    });

    try {
      step = "VALIDATE_INPUT_EMAIL";
      log("STEP 1: Validating invitation email");

      if (!input.email?.trim()) {
        throw new Error("Invitation email is required");
      }

      const email = input.email.trim().toLowerCase();

      log("STEP 1 SUCCESS: Email normalized", {
        emailProvided: Boolean(email),
      });

      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + 72 * 60 * 60 * 1000,
      );

      log("STEP 2: Invitation expiry calculated", {
        issuedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });

      step = "TRANSACTION_START";
      log("STEP 3: Starting PostgreSQL transaction");

      const result = await prisma.$transaction(async (tx) => {
        log("STEP 3 SUCCESS: Transaction callback entered");

        // -----------------------------------------------------
        // 1. Initial idempotency check
        // -----------------------------------------------------

        step = "INITIAL_IDEMPOTENCY_CHECK";
        log("STEP 4: Checking for existing invitation", {
          invitationId: input.invitationId,
        });

        const existing = await tx.employeeInvitation.findUnique({
          where: { id: input.invitationId },
          include: { deliveries: true },
        });

        log("STEP 4 RESULT: Existing invitation lookup completed", {
          found: Boolean(existing),
          deliveryCount: existing?.deliveries.length ?? 0,
        });

        if (existing) {
          step = "INITIAL_IDEMPOTENCY_RETURN";
          log("STEP 4: Existing invitation found; validating identity");

          const existingResult = this.toResult(existing, input);

          log("STEP 4 SUCCESS: Returning existing invitation", {
            invitationId: existingResult.invitationId,
            deliveryId: existingResult.deliveryId,
            status: existingResult.status,
          });

          return existingResult;
        }

        // -----------------------------------------------------
        // 2. Lock employee row
        // -----------------------------------------------------

        step = "LOCK_EMPLOYEE";
        log("STEP 5: Attempting to lock employee row", {
          employeeId: input.employeeId,
          businessId: input.businessId,
        });

        const lockedEmployees = await tx.$queryRaw<
          Array<{ id: string }>
        >`
          SELECT "id"
          FROM "Employee"
          WHERE "id" = ${input.employeeId}
            AND "businessId" = ${input.businessId}
          FOR UPDATE
        `;

        log("STEP 5 RESULT: Employee row-lock query completed", {
          matchedRows: lockedEmployees.length,
          employeeFound: lockedEmployees.length > 0,
        });

        if (lockedEmployees.length === 0) {
          throw new Error(
            "Employee not found for this business",
          );
        }

        // -----------------------------------------------------
        // 3. Recheck idempotency after acquiring the lock
        // -----------------------------------------------------

        step = "POST_LOCK_IDEMPOTENCY_CHECK";
        log("STEP 6: Rechecking invitation after employee lock");

        const existingAfterLock =
          await tx.employeeInvitation.findUnique({
            where: { id: input.invitationId },
            include: { deliveries: true },
          });

        log("STEP 6 RESULT: Post-lock invitation lookup completed", {
          found: Boolean(existingAfterLock),
        });

        if (existingAfterLock) {
          const existingResult = this.toResult(
            existingAfterLock,
            input,
          );

          log("STEP 6 SUCCESS: Returning existing invitation", {
            invitationId: existingResult.invitationId,
            deliveryId: existingResult.deliveryId,
            status: existingResult.status,
          });

          return existingResult;
        }

        // -----------------------------------------------------
        // 4. Load and validate employee
        // -----------------------------------------------------

        step = "LOAD_EMPLOYEE";
        log("STEP 7: Loading employee from PostgreSQL");

        const employee = await tx.employee.findUnique({
          where: { id: input.employeeId },
        });

        log("STEP 7 RESULT: Employee lookup completed", {
          found: Boolean(employee),
          businessMatches:
            employee?.businessId === input.businessId,
          employmentStatus: employee?.employmentStatus ?? null,
          branchMatches:
            employee?.branchId === input.branchId,
          emailPresent: Boolean(employee?.email?.trim()),
        });

        step = "VALIDATE_EMPLOYEE";
        log("STEP 8: Validating employee eligibility");

        if (
          !employee ||
          employee.businessId !== input.businessId ||
          employee.employmentStatus !== EmploymentStatus.INVITED
        ) {
          throw new Error(
            "Employee is not eligible for invitation",
          );
        }

        log("STEP 8 SUCCESS: Employee is eligible");

        // -----------------------------------------------------
        // 5. Validate branch
        // -----------------------------------------------------

        step = "VALIDATE_BRANCH";
        log("STEP 9: Validating invitation branch", {
          branchId: input.branchId,
        });

        if (input.branchId !== null) {
          const branch = await tx.branch.findFirst({
            where: {
              id: input.branchId,
              businessId: input.businessId,
            },
            select: { id: true },
          });

          log("STEP 9 RESULT: Branch lookup completed", {
            found: Boolean(branch),
          });

          if (!branch) {
            throw new Error(
              "Branch does not belong to this business",
            );
          }
        } else {
          log("STEP 9: No branch supplied; skipping branch lookup");
        }

        if (employee.branchId !== input.branchId) {
          throw new Error(
            "Invitation branch does not match employee branch",
          );
        }

        log("STEP 9 SUCCESS: Branch validation passed");

        // -----------------------------------------------------
        // 6. Validate email
        // -----------------------------------------------------

        step = "VALIDATE_EMPLOYEE_EMAIL";
        log("STEP 10: Comparing invitation email with employee email");

        const employeeEmail = employee.email
          ?.trim()
          .toLowerCase();

        if (!employeeEmail || employeeEmail !== email) {
          throw new Error(
            "Invitation email does not match employee email",
          );
        }

        log("STEP 10 SUCCESS: Email validation passed");

        // -----------------------------------------------------
        // 7. Check pending invitations
        // -----------------------------------------------------

        step = "CHECK_PENDING_INVITATION";
        log("STEP 11: Checking for another pending invitation");

        const existingPending =
          await tx.employeeInvitation.findFirst({
            where: {
              employeeId: employee.id,
              status: EmployeeInvitationStatus.PENDING,
              expiresAt: { gt: now },
            },
            select: { id: true },
          });

        log("STEP 11 RESULT: Pending invitation check completed", {
          existingPending: Boolean(existingPending),
        });

        if (existingPending) {
          throw new Error(
            "Employee already has a pending invitation",
          );
        }

        log("STEP 11 SUCCESS: No active pending invitation found");

        // -----------------------------------------------------
        // 8. Generate invitation credentials
        // -----------------------------------------------------

        step = "GENERATE_INVITATION_CREDENTIALS";
        log("STEP 12: Generating invitation credentials");

        const rawToken = randomBytes(32).toString("hex");

        log("STEP 12.1 SUCCESS: Raw token generated", {
          tokenGenerated: Boolean(rawToken),
        });

        const tokenHash = createHash("sha256")
          .update(rawToken)
          .digest("hex");

        log("STEP 12.2 SUCCESS: Token hash generated", {
          hashGenerated: Boolean(tokenHash),
        });

        const encryptedToken =
          encryptInvitationToken(rawToken);

        log("STEP 12.3 SUCCESS: Token encrypted for delivery", {
          encryptedTokenGenerated: Boolean(encryptedToken),
        });

        const deliveryId = randomUUID();

        log("STEP 12 SUCCESS: Invitation credentials prepared", {
          deliveryId,
        });

        // -----------------------------------------------------
        // 9. Create invitation record
        // -----------------------------------------------------

        step = "CREATE_INVITATION";
        log("STEP 13: Creating invitation database record", {
          invitationId: input.invitationId,
          employeeId: employee.id,
          businessId: input.businessId,
          branchId: input.branchId,
          role: input.role,
          expiresAt: expiresAt.toISOString(),
        });

        const invitation = await tx.employeeInvitation.create({
          data: {
            id: input.invitationId,
            businessId: input.businessId,
            employeeId: employee.id,
            branchId: input.branchId,
            email: employeeEmail,
            role: input.role,
            status: EmployeeInvitationStatus.PENDING,
            tokenHash,
            expiresAt,
          },
        });

        log("STEP 13 SUCCESS: Invitation record created", {
          invitationId: invitation.id,
          employeeId: invitation.employeeId,
          businessId: invitation.businessId,
          status: invitation.status,
          expiresAt:
            invitation.expiresAt?.toISOString() ?? null,
        });

        // -----------------------------------------------------
        // 10. Create delivery job
        // -----------------------------------------------------

        step = "CREATE_DELIVERY_JOB";
        log("STEP 14: Creating email delivery job", {
          deliveryId,
          invitationId: invitation.id,
          channel: InvitationDeliveryChannel.EMAIL,
          status: InvitationDeliveryStatus.PENDING,
          maxAttempts: 5,
        });

        const delivery = await tx.invitationDelivery.create({
          data: {
            id: deliveryId,
            invitationId: invitation.id,
            businessId: input.businessId,
            channel: InvitationDeliveryChannel.EMAIL,
            recipient: employeeEmail,
            status: InvitationDeliveryStatus.PENDING,
            attempts: 0,
            maxAttempts: 5,
            nextAttemptAt: now,
            encryptedToken,
          },
        });

        log("STEP 14 SUCCESS: Email delivery job created", {
          deliveryId: delivery.id,
          invitationId: delivery.invitationId,
          channel: delivery.channel,
          status: delivery.status,
          attempts: delivery.attempts,
        });

        // -----------------------------------------------------
        // 11. Return transaction result
        // -----------------------------------------------------

        step = "TRANSACTION_PREPARE_RETURN";
        log("STEP 15: Preparing issuance result", {
          invitationId: invitation.id,
          deliveryId: delivery.id,
        });

        return {
          invitationId: invitation.id,
          deliveryId: delivery.id,
          status: invitation.status,
          expiresAt:
            invitation.expiresAt?.toISOString() ?? null,
        };
      });

      step = "TRANSACTION_COMMITTED";
      log("SUCCESS: Transaction committed; invitation issuance completed", {
        invitationId: result.invitationId,
        deliveryId: result.deliveryId,
        status: result.status,
        expiresAt: result.expiresAt,
      });

      return result;
    } catch (error) {
      logError("FAILED: Invitation issuance stopped", error);
      throw error;
    }
  }

  private toResult(
    invitation: {
      id: string;
      employeeId: string;
      businessId: string;
      status: EmployeeInvitationStatus;
      expiresAt: Date | null;
      deliveries: Array<{
        id: string;
        channel: InvitationDeliveryChannel;
      }>;
    },
    input: IssueInvitationInput,
  ) {
    if (
      invitation.employeeId !== input.employeeId ||
      invitation.businessId !== input.businessId
    ) {
      throw new Error(
        "Invitation ID conflicts with existing invitation",
      );
    }

    const delivery = invitation.deliveries.find(
      (item) =>
        item.channel === InvitationDeliveryChannel.EMAIL,
    );

    return {
      invitationId: invitation.id,
      deliveryId: delivery?.id ?? null,
      status: invitation.status,
      expiresAt:
        invitation.expiresAt?.toISOString() ?? null,
    };
  }
}
