import { BillingCommandStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient

export class BillingIdempotencyRepository {
  async create(
    data: Prisma.BillingCommandIdempotencyCreateInput,
    tx: DbClient
  ) {
    return tx.billingCommandIdempotency.create({ data });
  }

  async findByKey(
    scope: string,
    idempotencyKey: string,
    tx: DbClient
  ) {
    return tx.billingCommandIdempotency.findUnique({
      where: {
        scope_idempotencyKey: {
          scope,
          idempotencyKey,
        },
      },
    });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingCommandIdempotency.findUnique({
      where: { id },
    });
  }

  async markCompleted(
    id: string,
    data: {
      resultReference?: string;
      response?: Prisma.InputJsonValue;
    },
    tx: DbClient
  ) {
    return tx.billingCommandIdempotency.update({
      where: { id },
      data: {
        status: BillingCommandStatus.COMPLETED,
        ...(data.resultReference !== undefined && {
          resultReference: data.resultReference,
        }),
        ...(data.response !== undefined && { response: data.response }),
        completedAt: new Date(),
        error: null,
      },
    });
  }

  async markFailed(
    id: string,
    error: string,
    tx: DbClient
  ) {
    return tx.billingCommandIdempotency.update({
      where: { id },
      data: {
        status: BillingCommandStatus.FAILED,
        error,
        completedAt: new Date(),
      },
    });
  }

  async findProcessing(
    olderThan: Date,
    take = 100
  ) {
    return prisma.billingCommandIdempotency.findMany({
      where: {
        status: BillingCommandStatus.PROCESSING,
        createdAt: { lte: olderThan },
      },
      take,
      orderBy: { createdAt: "asc" },
    });
  }

  async deleteExpired(before: Date) {
    return prisma.billingCommandIdempotency.deleteMany({
      where: {
        completedAt: { lt: before },
        status: {
          in: [
            BillingCommandStatus.COMPLETED,
            BillingCommandStatus.FAILED,
          ],
        },
      },
    });
  }
}
