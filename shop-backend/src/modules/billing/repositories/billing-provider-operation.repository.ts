import { BillingProviderOperationStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


type DbClient = Prisma.TransactionClient

export class BillingProviderOperationRepository {

  async create(
    data: Prisma.BillingProviderOperationCreateInput,
    tx: DbClient
  ) {
    return tx.billingProviderOperation.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingProviderOperation.findUnique({
      where: { id },
      include: {
        payment: true,
        attempt: true,
        account: true,
      },
    });
  }

  async findByIdempotencyKey(
    idempotencyKey: string,
    tx: DbClient
  ) {
    return tx.billingProviderOperation.findUnique({
      where: { idempotencyKey },
    });
  }

  async update(
    id: string,
    data: Prisma.BillingProviderOperationUpdateInput,
    tx: DbClient
  ) {
    return tx.billingProviderOperation.update({
      where: { id },
      data,
    });
  }

  async markProcessing(id: string, tx: DbClient) {
    return tx.billingProviderOperation.update({
      where: { id },
      data: {
        status: BillingProviderOperationStatus.PROCESSING,
        attempts: { increment: 1 },
      },
    });
  }

  async markSucceeded(
    id: string,
    responsePayload: Prisma.InputJsonValue,
    providerReference?: string,
    tx: DbClient
  ) {
    return tx.billingProviderOperation.update({
      where: { id },
      data: {
        status: BillingProviderOperationStatus.SUCCEEDED,
        responsePayload,
        providerReference,
        completedAt: new Date(),
        lastError: null,
      },
    });
  }

  async markFailed(
    id: string,
    error: string,
    nextAttemptAt: Date | null,
    tx: DbClient
  ) {
    return tx.billingProviderOperation.update({
      where: { id },
      data: {
        status: BillingProviderOperationStatus.FAILED,
        lastError: error,
        nextAttemptAt,
      },
    });
  }

  async requireReconciliation(
    id: string,
    error: string,
    tx: DbClient
  ) {
    return tx.billingProviderOperation.update({
      where: { id },
      data: {
        status:
          BillingProviderOperationStatus.REQUIRES_RECONCILIATION,
        lastError: error,
      },
    });
  }

  async findRetryable(now = new Date(), take = 100) {
    return prisma.billingProviderOperation.findMany({
      where: {
        status: BillingProviderOperationStatus.FAILED,
        OR: [
          { nextAttemptAt: null },
          { nextAttemptAt: { lte: now } },
        ],
      },
      take,
      orderBy: { createdAt: "asc" },
    });
  }

  async findReconciliationRequired(take = 100) {
    return prisma.billingProviderOperation.findMany({
      where: {
        status:
          BillingProviderOperationStatus.REQUIRES_RECONCILIATION,
      },
      take,
      orderBy: { createdAt: "asc" },
    });
  }

  async findByPaymentId(paymentId: string) {
    return prisma.billingProviderOperation.findMany({
      where: { paymentId },
      orderBy: { createdAt: "desc" },
    });
  }
}
