import { BillingEventStatus } from "../../../infrastructure/postgresql/prisma/generated/client.js";7
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient 

export class BillingOutboxRepository {

  async create(
    data: Prisma.BillingOutboxCreateInput,
    tx: DbClient
  ) {
    return tx.billingOutbox.create({ data });
  }

  async createMany(
    data: Prisma.BillingOutboxCreateManyInput[],
    tx: DbClient
  ) {
    return tx.billingOutbox.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findById(id: string, tx: DbClient) {
    return tx.billingOutbox.findUnique({
      where: { id },
      include: { event: true },
    });
  }

  async findByEventAndDestination(
    eventId: string,
    destination: string,
    tx: DbClient
  ) {
    return tx.billingOutbox.findUnique({
      where: {
        eventId_destination: {
          eventId,
          destination,
        },
      },
    });
  }

  async findPending(now = new Date(), take = 100) {
    return prisma.billingOutbox.findMany({
      where: {
        status: BillingEventStatus.PENDING,
        nextAttemptAt: { lte: now },
      },
      take,
      orderBy: { createdAt: "asc" },
      include: { event: true },
    });
  }

  async markPublished(id: string, tx: DbClient) {
    return tx.billingOutbox.update({
      where: { id },
      data: {
        status: BillingEventStatus.PUBLISHED,
        publishedAt: new Date(),
        lastError: null,
      },
    });
  }

  async markFailed(
    id: string,
    error: string,
    nextAttemptAt: Date,
    tx: DbClient
  ) {
    return tx.billingOutbox.update({
      where: { id },
      data: {
        status: BillingEventStatus.FAILED,
        attempts: { increment: 1 },
        lastError: error,
        nextAttemptAt,
      },
    });
  }

  async retry(
    id: string,
    nextAttemptAt: Date,
    tx: DbClient
  ) {
    return tx.billingOutbox.update({
      where: { id },
      data: {
        status: BillingEventStatus.PENDING,
        nextAttemptAt,
      },
    });
  }

  async countByStatus(status: BillingEventStatus) {
    return prisma.billingOutbox.count({
      where: { status },
    });
  }
}
