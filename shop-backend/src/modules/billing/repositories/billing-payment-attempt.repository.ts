import { BillingPaymentAttemptStatus } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient 

export class BillingPaymentAttemptRepository {

  async create(
    data: Prisma.BillingPaymentAttemptCreateInput,
    tx: DbClient
  ) {
    return tx.billingPaymentAttempt.create({ data });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingPaymentAttempt.findUnique({
      where: { id },
      include: { payment: true, operations: true },
    });
  }

  async findByPaymentId(paymentId: string, tx: DbClient) {
    return tx.billingPaymentAttempt.findMany({
      where: { paymentId },
      orderBy: { attemptNumber: "asc" },
      include: { operations: true },
    });
  }

  async findByProviderReference(
    providerReference: string,
    tx: DbClient
  ) {
    return tx.billingPaymentAttempt.findFirst({
      where: { providerReference },
      include: { payment: true },
    });
  }

  async findLatestByPaymentId(
    paymentId: string,
    tx: DbClient
  ) {
    return tx.billingPaymentAttempt.findFirst({
      where: { paymentId },
      orderBy: { attemptNumber: "desc" },
    });
  }

  async getNextAttemptNumber(
    paymentId: string,
    tx: DbClient
  ) {
    const latest = await tx.billingPaymentAttempt.findFirst({
      where: { paymentId },
      orderBy: { attemptNumber: "desc" },
      select: { attemptNumber: true },
    });

    return (latest?.attemptNumber ?? 0) + 1;
  }

  async update(
    id: string,
    data: Prisma.BillingPaymentAttemptUpdateInput,
    tx: DbClient 
  ) {
    return tx.billingPaymentAttempt.update({
      where: { id },
      data,
    });
  }

  async markPending(id: string, tx: DbClient) {
    return tx.billingPaymentAttempt.update({
      where: { id },
      data: {
        status: BillingPaymentAttemptStatus.PENDING,
      },
    });
  }

  async markSuccessful(id: string, tx: DbClient) {
    return tx.billingPaymentAttempt.update({
      where: { id },
      data: {
        status: BillingPaymentAttemptStatus.SUCCESS,
        completedAt: new Date(),
      },
    });
  }

  async markFailed(
    id: string,
    failureReason: string,
    tx: DbClient
  ) {
    return tx.billingPaymentAttempt.update({
      where: { id },
      data: {
        status: BillingPaymentAttemptStatus.FAILED,
        failureReason,
        completedAt: new Date(),
      },
    });
  }

  async markAbandoned(id: string, tx: DbClient) {
    return tx.billingPaymentAttempt.update({
      where: { id },
      data: {
        status: BillingPaymentAttemptStatus.ABANDONED,
        completedAt: new Date(),
      },
    });
  }

  async findStalePending(
    before: Date,
    take = 100
  ) {
    return prisma.billingPaymentAttempt.findMany({
      where: {
        status: {
          in: [
            BillingPaymentAttemptStatus.INITIATED,
            BillingPaymentAttemptStatus.PENDING,
          ],
        },
        startedAt: { lte: before },
      },
      take,
      orderBy: { startedAt: "asc" },
    });
  }

  async countByPaymentId(paymentId: string) {
    return prisma.billingPaymentAttempt.count({
      where: { paymentId },
    });
  }
}
