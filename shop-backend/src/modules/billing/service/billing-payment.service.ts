import {
  BillingPaymentAttemptStatus,
  BillingPaymentStatus,
  BillingProvider,
  BillingProviderOperationStatus
}from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


interface InitiatePaymentInput {
  businessId: string;
  subscriptionId?: string;
  invoiceId: string;
  provider: BillingProvider;
  method: string;
  amountMinor: bigint;
  currency: string;
  idempotencyKey: string;
}

interface ProviderPaymentResult {
  providerReference: string;
  authorizationUrl?: string;
  accessCode?: string;
  rawResponse?: Prisma.InputJsonValue;
}

export class BillingPaymentService {

  async initiate(input: InitiatePaymentInput) {
    if (input.amountMinor <= 0n) {
      throw new Error("Payment amount must be greater than zero");
    }

    if (!input.idempotencyKey.trim()) {
      throw new Error("An idempotency key is required");
    }

    return prisma.$transaction(
      async (tx) => {
        const invoice = await tx.billingInvoice.findFirst({
          where: {
            id: input.invoiceId,
            businessId: input.businessId,
          },
        });

        if (!invoice) throw new Error("Invoice not found");

        if (invoice.currency !== input.currency.toUpperCase()) {
          throw new Error("Payment currency does not match invoice currency");
        }

        if (invoice.amountDueMinor <= 0n) {
          throw new Error("Invoice has no outstanding balance");
        }

        if (input.amountMinor > invoice.amountDueMinor) {
          throw new Error("Payment amount exceeds invoice balance");
        }

        const existing = await tx.billingCommandIdempotency.findUnique({
          where: {
            scope_idempotencyKey: {
              scope: `payment:${input.businessId}`,
              idempotencyKey: input.idempotencyKey,
            },
          },
        });

        if (existing?.status === "COMPLETED" && existing.resultReference) {
          return tx.billingPayment.findUnique({
            where: { id: existing.resultReference },
            include: { attempts: true },
          });
        }

        if (existing?.status === "PROCESSING") {
          throw new Error("This payment request is already being processed");
        }

        if (existing?.status === "FAILED") {
          throw new Error("This idempotency key belongs to a failed request");
        }

        const payment = await tx.billingPayment.create({
          data: {
            id: crypto.randomUUID(),
            businessId: input.businessId,
            subscriptionId: input.subscriptionId ?? null,
            invoiceId: input.invoiceId,
            provider: input.provider,
            method: input.method as never,
            status: BillingPaymentStatus.INITIATED,
            currency: input.currency.toUpperCase(),
            amountMinor: input.amountMinor,
            providerFeeMinor: 0n,
            refundedMinor: 0n,
          },
        });

        const attempt = await tx.billingPaymentAttempt.create({
          data: {
            id: crypto.randomUUID(),
            businessId: input.businessId,
            paymentId: payment.id,
            provider: input.provider,
            attemptNumber: 1,
            status: BillingPaymentAttemptStatus.INITIATED,
            startedAt: new Date(),
          },
        });

        await tx.billingProviderOperation.create({
          data: {
            id: crypto.randomUUID(),
            provider: input.provider,
            operationType: "INITIALIZE_PAYMENT",
            idempotencyKey: input.idempotencyKey,
            paymentId: payment.id,
            attemptId: attempt.id,
            status: BillingProviderOperationStatus.PENDING,
            attempts: 0,
            requestPayload: {
              businessId: input.businessId,
              invoiceId: input.invoiceId,
              amountMinor: input.amountMinor.toString(),
              currency: input.currency.toUpperCase(),
              method: input.method,
            },
          },
        });

        await tx.billingCommandIdempotency.create({
          data: {
            id: crypto.randomUUID(),
            scope: `payment:${input.businessId}`,
            idempotencyKey: input.idempotencyKey,
            commandType: "INITIATE_PAYMENT",
            requestHash: [
              input.invoiceId,
              input.amountMinor.toString(),
              input.currency.toUpperCase(),
              input.provider,
            ].join(":"),
            status: "PROCESSING",
            resultReference: payment.id,
          },
        });

        return payment;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /**
   * Persist the result returned by the provider adapter.
   * This is not a payment confirmation; it only records initialization.
   */
  async recordInitializationResult(
    paymentId: string,
    attemptId: string,
    result: ProviderPaymentResult,
  ) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.billingPayment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) throw new Error("Payment not found");

      const attempt = await tx.billingPaymentAttempt.findFirst({
        where: { id: attemptId, paymentId },
      });

      if (!attempt) throw new Error("Payment attempt not found");

      await tx.billingPaymentAttempt.update({
        where: { id: attemptId },
        data: {
          providerReference: result.providerReference,
          status: BillingPaymentAttemptStatus.PENDING,
        },
      });

      const updated = await tx.billingPayment.update({
        where: { id: paymentId },
        data: {
          providerReference: result.providerReference,
          status: BillingPaymentStatus.PENDING,
          aggregateVersion: { increment: 1 },
        },
      });

      await tx.billingProviderOperation.updateMany({
        where: {
          paymentId,
          attemptId,
          operationType: "INITIALIZE_PAYMENT",
        },
        data: {
          status: BillingProviderOperationStatus.SUCCEEDED,
          providerReference: result.providerReference,
          responsePayload: result.rawResponse,
          completedAt: new Date(),
        },
      });

      await tx.billingCommandIdempotency.updateMany({
        where: {
          resultReference: paymentId,
          commandType: "INITIATE_PAYMENT",
          status: "PROCESSING",
        },
        data: {
          status: "COMPLETED",
          response: {
            providerReference: result.providerReference,
            authorizationUrl: result.authorizationUrl ?? null,
          },
          completedAt: new Date(),
        },
      });

      return {
        payment: updated,
        providerReference: result.providerReference,
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
      };
    });
  }

  /**
   * Call only after server-side provider verification or reconciliation.
   * Webhook payloads must not be passed directly without signature checks
   * and provider verification.
   */
  async confirmFromVerifiedProvider(input: {
    paymentId: string;
    providerReference: string;
    providerFeeMinor?: bigint;
    netAmountMinor?: bigint;
  }) {
    return prisma.$transaction(
      async (tx) => {
        const payment = await tx.billingPayment.findUnique({
          where: { id: input.paymentId },
        });

        if (!payment) throw new Error("Payment not found");

        if (payment.providerReference !== input.providerReference) {
          throw new Error("Provider reference mismatch");
        }

        if (payment.status === BillingPaymentStatus.CONFIRMED) {
          return payment;
        }

        if (
          payment.status === BillingPaymentStatus.REFUNDED ||
          payment.status === BillingPaymentStatus.REVERSED
        ) {
          throw new Error("A refunded or reversed payment cannot be confirmed");
        }

        const updated = await tx.billingPayment.update({
          where: { id: payment.id },
          data: {
            status: BillingPaymentStatus.CONFIRMED,
            providerFeeMinor: input.providerFeeMinor ?? payment.providerFeeMinor,
            netAmountMinor: input.netAmountMinor ?? payment.netAmountMinor,
            aggregateVersion: { increment: 1 },
          },
        });

        await tx.billingPaymentAttempt.updateMany({
          where: { paymentId: payment.id },
          data: {
            status: BillingPaymentAttemptStatus.SUCCESS,
            completedAt: new Date(),
          },
        });

        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async markFailed(
    paymentId: string,
    reason: string,
    providerReference?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.billingPayment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) throw new Error("Payment not found");

      if (payment.status === BillingPaymentStatus.CONFIRMED) {
        throw new Error("A confirmed payment cannot be marked failed");
      }

      const updated = await tx.billingPayment.update({
        where: { id: paymentId },
        data: {
          status: BillingPaymentStatus.FAILED,
          failureReason: reason,
          providerReference:
            providerReference ?? payment.providerReference,
          aggregateVersion: { increment: 1 },
        },
      });

      await tx.billingPaymentAttempt.updateMany({
        where: {
          paymentId,
          status: {
            in: [
              BillingPaymentAttemptStatus.INITIATED,
              BillingPaymentAttemptStatus.PENDING,
            ],
          },
        },
        data: {
          status: BillingPaymentAttemptStatus.FAILED,
          failureReason: reason,
          completedAt: new Date(),
        },
      });

      return updated;
    });
  }

  async getPayment(businessId: string, paymentId: string) {
    return prisma.billingPayment.findFirst({
      where: { id: paymentId, businessId },
      include: {
        attempts: true,
        allocations: {
          include: { invoice: true },
        },
        refunds: true,
      },
    });
  }

  async listPayments(businessId: string, take = 50) {
    return prisma.billingPayment.findMany({
      where: { businessId },
      take: Math.min(Math.max(take, 1), 100),
      orderBy: { createdAt: "desc" },
      include: { attempts: true, allocations: true },
    });
  }
}
