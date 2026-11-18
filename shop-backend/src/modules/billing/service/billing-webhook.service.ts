import {
  BillingProvider,
  BillingWebhookStatus,
  Prisma,
  PrismaClient,
} from "../../generated/client";

import { BillingProviderRegistry } from "../providers/billing-provider.interface";

interface ReceiveWebhookInput {
  provider: BillingProvider;
  signature?: string;
  rawBody: Buffer;
  headers: Record<string, string | string[] | undefined>;
}

export class BillingWebhookService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly registry: BillingProviderRegistry,
  ) {}

  async receive(input: ReceiveWebhookInput) {
    const adapter = this.registry.get(input.provider);

    const verification = await adapter.verifyWebhook({
      rawBody: input.rawBody,
      signature: input.signature,
      headers: input.headers,
    });

    if (!verification.valid) {
      throw new Error("Invalid webhook signature");
    }

    if (!verification.eventId || !verification.eventType) {
      throw new Error("Webhook event identity is missing");
    }

    const payload = verification.payload as Prisma.InputJsonValue;

    try {
      return await this.prisma.billingProviderWebhookEvent.create({
        data: {
          provider: input.provider,
          providerEventId: verification.eventId,
          eventType: verification.eventType,
          payload,
          status: BillingWebhookStatus.RECEIVED,
          receivedAt: new Date(),
          processingAttempts: 0,
        },
      });
    } catch (error) {
      // Prisma P2002 means this provider event has already been received.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return this.prisma.billingProviderWebhookEvent.findUnique({
          where: {
            provider_providerEventId: {
              provider: input.provider,
              providerEventId: verification.eventId,
            },
          },
        });
      }

      throw error;
    }
  }

  async process(eventId: string) {
    const event = await this.prisma.billingProviderWebhookEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) throw new Error("Webhook event not found");

    if (
      event.status === BillingWebhookStatus.PROCESSED ||
      event.status === BillingWebhookStatus.IGNORED
    ) {
      return event;
    }

    const claimed = await this.prisma.billingProviderWebhookEvent.updateMany({
      where: {
        id: event.id,
        status: {
          in: [
            BillingWebhookStatus.RECEIVED,
            BillingWebhookStatus.FAILED,
          ],
        },
      },
      data: {
        status: BillingWebhookStatus.PROCESSING,
        processingAttempts: { increment: 1 },
      },
    });

    if (claimed.count === 0) {
      return this.prisma.billingProviderWebhookEvent.findUnique({
        where: { id: event.id },
      });
    }

    try {
      const payload = event.payload as Record<string, unknown>;

      if (
        event.provider === BillingProvider.PAYSTACK &&
        event.eventType === "charge.success"
      ) {
        const data = payload.data as Record<string, unknown> | undefined;
        const reference = data?.reference;

        if (typeof reference !== "string") {
          throw new Error("Paystack success event has no payment reference");
        }

        const payment = await this.prisma.billingPayment.findFirst({
          where: {
            provider: BillingProvider.PAYSTACK,
            providerReference: reference,
          },
        });

        if (!payment) {
          throw new Error(`No local payment found for provider reference ${reference}`);
        }

        // Provider verification is required before changing local payment state.
        const adapter = this.registry.get(BillingProvider.PAYSTACK);
        const verification = await adapter.verifyPayment({ reference });

        if (
          !verification.successful ||
          verification.amountMinor !== payment.amountMinor ||
          verification.currency.toUpperCase() !== payment.currency.toUpperCase()
        ) {
          throw new Error("Provider verification did not match local payment");
        }

        await this.prisma.$transaction(async (tx) => {
          const current = await tx.billingPayment.findUniqueOrThrow({
            where: { id: payment.id },
          });

          if (current.status !== "CONFIRMED") {
            await tx.billingPayment.update({
              where: { id: payment.id },
              data: {
                status: "CONFIRMED",
                providerFeeMinor:
                  verification.feeMinor ?? current.providerFeeMinor,
                netAmountMinor:
                  verification.netAmountMinor ?? current.netAmountMinor,
                aggregateVersion: { increment: 1 },
              },
            });

            await tx.billingPaymentAttempt.updateMany({
              where: { paymentId: payment.id },
              data: {
                status: "SUCCESS",
                completedAt: verification.paidAt ?? new Date(),
              },
            });
          }

          await tx.billingProviderWebhookEvent.update({
            where: { id: event.id },
            data: {
              status: BillingWebhookStatus.PROCESSED,
              processedAt: new Date(),
              lastError: null,
            },
          });
        });
      } else {
        // Unknown or currently unsupported event types are retained for audit.
        await this.prisma.billingProviderWebhookEvent.update({
          where: { id: event.id },
          data: {
            status: BillingWebhookStatus.IGNORED,
            processedAt: new Date(),
          },
        });
      }

      return this.prisma.billingProviderWebhookEvent.findUnique({
        where: { id: event.id },
      });
    } catch (error) {
      await this.prisma.billingProviderWebhookEvent.update({
        where: { id: event.id },
        data: {
          status: BillingWebhookStatus.FAILED,
          lastError:
            error instanceof Error ? error.message : "Webhook processing failed",
        },
      });

      throw error;
    }
  }

  async retryFailed(limit = 50) {
    const failed = await this.prisma.billingProviderWebhookEvent.findMany({
      where: {
        status: {
          in: [
            BillingWebhookStatus.RECEIVED,
            BillingWebhookStatus.FAILED,
          ],
        },
      },
      take: Math.min(Math.max(limit, 1), 200),
      orderBy: { receivedAt: "asc" },
      select: { id: true },
    });

    const results = [];

    for (const item of failed) {
      try {
        results.push(await this.process(item.id));
      } catch {
        // The event remains FAILED with its lastError for the next retry.
      }
    }

    return results;
  }
}
