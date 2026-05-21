import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class SyncRepository {

  /* =========================
     IDEMPOTENCY
  ========================= */

  async findExistingEvent(
    eventId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.event.findUnique({
      where: { id: eventId },
    });
  }

  async assertEventIntegrity(incoming: any, existing: any) {
    if (
      JSON.stringify(existing.payload) !==
      JSON.stringify(incoming.payload)
    ) {
      throw new Error(
        `EVENT_ID_COLLISION ${incoming.id}`
      );
    }
  }

  /* =========================
     REPLICA CLOCK DEDUP
  ========================= */

  async validateReplicaClock(
    event: any,
    tx: Prisma.TransactionClient
  ) {
    const duplicate = await tx.event.findFirst({
      where: {
        deviceId: event.deviceId,
        logicClock: event.logicClock,
      },
    });

    if (duplicate && duplicate.id !== event.id) {
      throw new Error(
        `DUPLICATE_CLOCK ${event.deviceId}:${event.logicClock}`
      );
    }
  }

  /* =========================
     STORE EVENT (NO VERSION LOGIC)
  ========================= */

  async storeEvent(
    event: any,
    tx: Prisma.TransactionClient
  ) {

    const existing =
      await this.findExistingEvent(event.id, tx);

    if (existing) {
      await this.assertEventIntegrity(event, existing);
      return existing;
    }

    await this.validateReplicaClock(event, tx);

    return tx.event.create({
      data: {
        id: event.id,

        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        aggregateVersion: event.aggregateVersion,

        type: event.type,
        payload: event.payload,

        scope: event.scope,
        mode: event.mode,

        businessId: event.businessId ?? null,
        branchId: event.branchId ?? null,
        branchBusinessId: event.branchBusinessId ?? null,

        logicClock: event.logicClock,
        deviceId: event.deviceId,

        userId: event.userId ?? null,

        status: "SYNCED",
        synced: true,

        causationId:
            event.causationId === null
              ? undefined
              : event.causationId,

          correlationId:
            event.correlationId === null
              ? undefined
              : event.correlationId,

        createdAt: new Date(event.createdAt),

      },
    });
  }

  /* =========================
     PROCESSED TRACKING
  ========================= */

  async markProcessed(saved: any, tx: Prisma.TransactionClient) {
    return tx.processedSyncEvent.upsert({
      where: { id: saved.id },
      update: {
        status: "SYNCED",
        version: saved.aggregateVersion,
      },
      create: {
        id: saved.id,
        eventType: saved.type,
        businessId: saved.businessId,
        branchId: saved.branchId,
        branchBusinessId: saved.branchBusinessId,
        userId: saved.userId,
        version: saved.aggregateVersion,
        status: "SYNCED",
      },
    });
  }

  async markFailed(event: any, error: string) {
    return prisma.processedSyncEvent.upsert({
      where: { id: event.id },
      update: {
        status: "FAILED",
        error,
      },
      create: {
        id: event.id,
        eventType: event.type,
        businessId: event.businessId ?? null,
        branchId: event.branchId ?? null,
        branchBusinessId: event.branchBusinessId ?? null,
        userId: event.userId ?? null,
        version: event.expectedAggregateVersion ?? null,
        status: "FAILED",
        error,
      },
    });
  }

  /* =========================
     READ MODELS
  ========================= */

  async findEventsAfterSnapshotVersion(
    aggregateId: string,
    aggregateType: string,
    version: number
  ) {
    return prisma.event.findMany({
      where: {
        aggregateId,
        aggregateType,
        aggregateVersion: { gt: version },
      },
      orderBy: {
        aggregateVersion: "asc",
      },
    });
  }

  async getLastAggregateVersion(
    aggregateId: string,
    aggregateType: string
  ) {
    return prisma.event.findFirst({
      where: { aggregateId, aggregateType },
      orderBy: { aggregateVersion: "desc" },
    });
  }
}