import { BillingProvider, PrismaClient } from "../../generated/client";
import { BillingProviderRegistry } from "../providers/billing-provider.interface";

export class BillingProviderService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly registry: BillingProviderRegistry,
  ) {}

  async initializePayment(paymentId: string, callbackUrl: string) {
    const payment = await this.prisma.billingPayment.findUnique({
      where: { id: paymentId },
      include: { business: true },
    });

    if (!payment) throw new Error("Payment not found");

    const provider = this.registry.get(payment.provider);

    const operation = await this.prisma.billingProviderOperation.findFirst({
      where: {
        paymentId,
        operationType: "INITIALIZE_PAYMENT",
        status: "PENDING",
      },
      orderBy: { createdAt: "asc" },
    });

    if (!operation) {
      throw new Error("No pending initialization operation exists");
    }

    const payload = operation.requestPayload;

    if (
      payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    ) {
      throw new Error("Invalid provider operation payload");
    }

    const email = await this.resolveBusinessBillingEmail(payment.businessId);

    try {
      const result = await provider.initializePayment({
        reference: operation.idempotencyKey,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        email,
        callbackUrl,
        metadata: {
          paymentId: payment.id,
          businessId: payment.businessId,
          operationId: operation.id,
        },
      });

      await this.prisma.$transaction(async (tx) => {
        await tx.billingProviderOperation.update({
          where: { id: operation.id },
          data: {
            status: "SUCCEEDED",
            providerReference: result.reference,
            responsePayload: result.rawResponse as never,
            attempts: { increment: 1 },
            completedAt: new Date(),
          },
        });

        await tx.billingPayment.update({
          where: { id: payment.id },
          data: {
            providerReference: result.reference,
            status: "PENDING",
            aggregateVersion: { increment: 1 },
          },
        });

        await tx.billingPaymentAttempt.updateMany({
          where: {
            paymentId: payment.id,
            status: "INITIATED",
          },
          data: {
            providerReference: result.reference,
            status: "PENDING",
          },
        });
      });

      return {
        paymentId: payment.id,
        providerReference: result.reference,
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
      };
    } catch (error) {
      await this.prisma.billingProviderOperation.update({
        where: { id: operation.id },
        data: {
          status: "FAILED",
          attempts: { increment: 1 },
          lastError:
            error instanceof Error ? error.message : "Provider initialization failed",
          nextAttemptAt: new Date(Date.now() + 60_000),
        },
      });

      throw error;
    }
  }

  async verifyPayment(paymentId: string) {
    const payment = await this.prisma.billingPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new Error("Payment not found");
    if (!payment.providerReference) {
      throw new Error("Payment has no provider reference");
    }

    const adapter = this.registry.get(payment.provider);

    const result = await adapter.verifyPayment({
      reference: payment.providerReference,
    });

    if (!result.successful) {
      return {
        verified: false,
        providerStatus: "NOT_SUCCESSFUL",
        paymentId,
      };
    }

    if (
      result.amountMinor !== payment.amountMinor ||
      result.currency.toUpperCase() !== payment.currency.toUpperCase()
    ) {
      await this.prisma.billingProviderOperation.create({
        data: {
          provider: payment.provider,
          operationType: "PAYMENT_RECONCILIATION",
          idempotencyKey: `reconcile:${payment.id}:${Date.now()}`,
          paymentId: payment.id,
          status: "REQUIRES_RECONCILIATION",
          attempts: 1,
          lastError: "Provider amount or currency does not match local payment",
          responsePayload: result.rawResponse as never,
        },
      });

      throw new Error("Provider payment does not match local amount or currency");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.billingPayment.update({
        where: { id: payment.id },
        data: {
          status: "CONFIRMED",
          providerFeeMinor: result.feeMinor ?? payment.providerFeeMinor,
          netAmountMinor:
            result.netAmountMinor ??
            (result.feeMinor !== undefined
              ? result.amountMinor - result.feeMinor
              : payment.netAmountMinor),
          aggregateVersion: { increment: 1 },
        },
      });

      await tx.billingPaymentAttempt.updateMany({
        where: { paymentId: payment.id },
        data: {
          status: "SUCCESS",
          completedAt: result.paidAt ?? new Date(),
        },
      });

      return {
        verified: true,
        payment: updated,
        providerResult: result,
      };
    });
  }

  private async resolveBusinessBillingEmail(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!business?.user?.email) {
      throw new Error("Business billing email could not be resolved");
    }

    return business.user.email;
  }
}
