import {
  BillingPaymentStatus,
  BillingRefundStatus,
  Prisma,
  PrismaClient,
} from "../../generated/client";

interface CreateRefundInput {
  businessId: string;
  paymentId: string;
  amountMinor: bigint;
  reason: string;
}

export class BillingRefundService {
  constructor(private readonly prisma: PrismaClient) {}

  async requestRefund(input: CreateRefundInput) {
    if (input.amountMinor <= 0n) {
      throw new Error("Refund amount must be greater than zero");
    }

    if (!input.reason.trim()) {
      throw new Error("A refund reason is required");
    }

    return this.prisma.$transaction(
      async (tx) => {
        const payment = await tx.billingPayment.findFirst({
          where: {
            id: input.paymentId,
            businessId: input.businessId,
          },
        });

        if (!payment) throw new Error("Payment not found");

        if (
          payment.status !== BillingPaymentStatus.CONFIRMED &&
          payment.status !== BillingPaymentStatus.PARTIALLY_REFUNDED
        ) {
          throw new Error("Only confirmed payments can be refunded");
        }

        await tx.$queryRaw`
          SELECT id FROM "BillingPayment"
          WHERE id = ${payment.id}
          FOR UPDATE
        `;

        const refunds = await tx.billingRefund.aggregate({
          where: {
            paymentId: payment.id,
            status: {
              in: [
                BillingRefundStatus.PENDING,
                BillingRefundStatus.PROCESSING,
                BillingRefundStatus.SUCCESS,
              ],
            },
          },
          _sum: { amountMinor: true },
        });

        const reservedRefunds = refunds._sum.amountMinor ?? 0n;
        const refundable = payment.amountMinor - reservedRefunds;

        if (input.amountMinor > refundable) {
          throw new Error("Refund exceeds the remaining refundable amount");
        }

        const refund = await tx.billingRefund.create({
          data: {
            businessId: input.businessId,
            paymentId: payment.id,
            amountMinor: input.amountMinor,
            currency: payment.currency,
            status: BillingRefundStatus.PENDING,
            reason: input.reason.trim(),
            requestedAt: new Date(),
          },
        });

        await tx.billingProviderOperation.create({
          data: {
            provider: payment.provider,
            operationType: "REFUND_PAYMENT",
            idempotencyKey: `refund:${refund.id}`,
            paymentId: payment.id,
            status: "PENDING",
            attempts: 0,
            requestPayload: {
              refundId: refund.id,
              paymentId: payment.id,
              providerReference: payment.providerReference,
              amountMinor: input.amountMinor.toString(),
              currency: payment.currency,
              reason: input.reason.trim(),
            },
          },
        });

        await tx.billingAuditLog.create({
          data: {
            businessId: input.businessId,
            action: "REFUNDED",
            entityType: "BillingRefund",
            entityId: refund.id,
            reason: input.reason.trim(),
            afterData: {
              amountMinor: input.amountMinor.toString(),
              paymentId: payment.id,
            },
          },
        });

        return refund;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async markProcessing(refundId: string, providerRefundReference?: string) {
    return this.prisma.billingRefund.update({
      where: { id: refundId },
      data: {
        status: BillingRefundStatus.PROCESSING,
        providerRefundReference,
      },
    });
  }

  async confirmRefund(
    refundId: string,
    providerRefundReference: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const refund = await tx.billingRefund.findUnique({
          where: { id: refundId },
        });

        if (!refund) throw new Error("Refund not found");

        if (refund.status === BillingRefundStatus.SUCCESS) {
          return refund;
        }

        if (
          refund.status === BillingRefundStatus.FAILED ||
          refund.status === BillingRefundStatus.REVERSED
        ) {
          throw new Error("Refund is not in a confirmable state");
        }

        const payment = await tx.billingPayment.findUnique({
          where: { id: refund.paymentId },
        });

        if (!payment) throw new Error("Payment not found");

        const successfulRefunds = await tx.billingRefund.aggregate({
          where: {
            paymentId: payment.id,
            status: BillingRefundStatus.SUCCESS,
          },
          _sum: { amountMinor: true },
        });

        const alreadyRefunded = successfulRefunds._sum.amountMinor ?? 0n;
        const newRefunded = alreadyRefunded + refund.amountMinor;

        if (newRefunded > payment.amountMinor) {
          throw new Error("Confirmed refunds exceed the original payment");
        }

        const updatedRefund = await tx.billingRefund.update({
          where: { id: refund.id },
          data: {
            status: BillingRefundStatus.SUCCESS,
            providerRefundReference,
            processedAt: new Date(),
          },
        });

        await tx.billingPayment.update({
          where: { id: payment.id },
          data: {
            refundedMinor: newRefunded,
            status:
              newRefunded === payment.amountMinor
                ? BillingPaymentStatus.REFUNDED
                : BillingPaymentStatus.PARTIALLY_REFUNDED,
            aggregateVersion: { increment: 1 },
          },
        });

        return updatedRefund;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async markFailed(refundId: string, reason: string) {
    return this.prisma.billingRefund.update({
      where: { id: refundId },
      data: {
        status: BillingRefundStatus.FAILED,
        reason,
        processedAt: new Date(),
      },
    });
  }

  async listRefunds(businessId: string, paymentId?: string) {
    return this.prisma.billingRefund.findMany({
      where: {
        businessId,
        ...(paymentId ? { paymentId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
