import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";
type DbClient = Prisma.TransactionClient;

export class PlatformProjectionEventRepository {

  async getTenantEvents(afterPosition: bigint, take = 100) {
    return prisma.event.findMany({
      where: {
        globalPosition: { gt: afterPosition },
      },
      orderBy: { globalPosition: "asc" },
      take,
      select: {
        id: true,
        businessId: true,
        globalPosition: true,
        type: true,
        payload: true,
        createdAt: true,
      },
    });
  }

  async getBillingEvents(
    after: { occurredAt: Date; id: string } | null,
    take = 100,
  ) {
    return prisma.billingEvent.findMany({
      where: after
        ? {
            OR: [
              { occurredAt: { gt: after.occurredAt } },
              {
                occurredAt: after.occurredAt,
                id: { gt: after.id },
              },
            ],
          }
        : undefined,
      orderBy: [{ occurredAt: "asc" }, { id: "asc" }],
      take,
      select: {
        id: true,
        businessId: true,
        eventType: true,
        payload: true,
        occurredAt: true,
      },
    });
  }

  async getCheckpoint(consumerName: string) {
    return prisma.platformProjectionCheckpoint.findUnique({
      where: { consumerName },
    });
  }

  async isProcessed(
    consumerName: string,
    eventId: string,
    tx: DbClient,
  ) {
    const record = await tx.platformProcessedEvent.findUnique({
      where: {
        consumerName_eventId: { consumerName, eventId },
      },
      select: { id: true },
    });

    return Boolean(record);
  }

  async markProcessed(
    consumerName: string,
    eventId: string,
    tx: DbClient,
  ) {
    return tx.platformProcessedEvent.create({
      data: { consumerName, eventId },
    });
  }

  async advanceTenantCheckpoint(
    consumerName: string,
    position: bigint,
    eventId: string,
    tx: DbClient,
  ) {
    return tx.platformProjectionCheckpoint.upsert({
      where: { consumerName },
      create: {
        consumerName,
        lastProcessedPosition: position,
        lastProcessedEventId: eventId,
        lastProcessedAt: new Date(),
      },
      update: {
        lastProcessedPosition: position,
        lastProcessedEventId: eventId,
        lastProcessedAt: new Date(),
      },
    });
  }

  async advanceBillingCheckpoint(
    consumerName: string,
    occurredAt: Date,
    eventId: string,
    tx: DbClient,
  ) {
    return tx.platformProjectionCheckpoint.upsert({
      where: { consumerName },
      create: {
        consumerName,
        lastProcessedEventId: eventId,
        lastProcessedAt: new Date(),
        cursor: {
          occurredAt: occurredAt.toISOString(),
          id: eventId,
        },
      },
      update: {
        lastProcessedEventId: eventId,
        lastProcessedAt: new Date(),
        cursor: {
          occurredAt: occurredAt.toISOString(),
          id: eventId,
        },
      },
    });
  }
}