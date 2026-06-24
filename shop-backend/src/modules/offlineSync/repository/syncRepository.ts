import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export class SyncRepository {

  /* ============================================================
      EVENT IDEMPOTENCY
  ============================================================ */

  async findExistingEvent(
    eventId: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.event.findUnique({
      where: {
        id: eventId,
      },
    });
  }

  /**
   * Ensures an existing event cannot be overwritten
   * with different data.
   */
  assertEventIntegrity(
    incoming: any,
    existing: any
  ) {

    const payloadEqual =
      JSON.stringify(existing.payload) ===
      JSON.stringify(incoming.payload);

    const valid =
      existing.aggregateId === incoming.aggregateId &&
      existing.aggregateType === incoming.aggregateType &&
      existing.aggregateVersion === incoming.aggregateVersion &&
      existing.type === incoming.type &&
      existing.deviceId === incoming.deviceId &&
      existing.logicClock === incoming.logicClock &&
      existing.scope === incoming.scope &&
      existing.mode === incoming.mode &&
      payloadEqual;

    if (!valid) {
      throw new Error(
        `EVENT_ID_COLLISION: ${incoming.id}`
      );
    }
  }

  /* ============================================================
      REPLICA CLOCK VALIDATION
  ============================================================ */

  async validateReplicaClock(
    event: any,
    tx: Prisma.TransactionClient
  ) {

    const where: any = {
      deviceId: event.deviceId,
      logicClock: event.logicClock,
    };

    const existing = await tx.event.findFirst({ where });

    // Clock never used
    if (!existing) {
      return;
    }

    // Same event replay (safe retry)
    if (existing.id === event.id) {
      return;
    }

    // Different event using same clock
    throw new Error(
      `DUPLICATE_CLOCK ${event.deviceId}:${event.logicClock}`
    );
  }

  /* ============================================================
      STORE EVENT
  ============================================================ */

  async storeEvent(
    event: any,
    tx: Prisma.TransactionClient
  ) {

    // STEP 1
    // Event idempotency

    const existing =
      await this.findExistingEvent(
        event.id,
        tx
      );

    if (existing) {

      this.assertEventIntegrity(
        event,
        existing
      );

      return existing;
    }

    // STEP 2
    // Replica clock uniqueness

    await this.validateReplicaClock(
      event,
      tx
    );

    // STEP 3
    // Store event

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

        deviceId: event.deviceId,
        logicClock: event.logicClock,

        userId: event.userId ?? null,

        status: "SYNCED",
        synced: true,

        causationId:
          event.causationId ?? null,

        correlationId:
          event.correlationId ?? null,

        createdAt:
          new Date(event.createdAt),

      },

    });

  }

  /* ============================================================
      PROCESSED EVENTS
  ============================================================ */

  async markProcessed(
    saved: any,
    tx: Prisma.TransactionClient
  ) {

    return tx.processedSyncEvent.upsert({

      where: {
        id: saved.id,
      },

      update: {

        status: "SYNCED",

        version:
          saved.aggregateVersion,

      },

      create: {

        id: saved.id,

        eventType:
          saved.type,

        businessId:
          saved.businessId,

        branchId:
          saved.branchId,

        branchBusinessId:
          saved.branchBusinessId,

        userId:
          saved.userId,

        version:
          saved.aggregateVersion,

        status:
          "SYNCED",

      },

    });

  }

  async markFailed(
    event: any,
    error: string
  ) {

    return prisma.processedSyncEvent.upsert({

      where: {
        id: event.id,
      },

      update: {

        status: "FAILED",

        error,

      },

      create: {

        id: event.id,

        eventType:
          event.type,

        businessId:
          event.businessId ?? null,

        branchId:
          event.branchId ?? null,

        branchBusinessId:
          event.branchBusinessId ?? null,

        userId:
          event.userId ?? null,

        version:
          event.aggregateVersion ?? null,

        status:
          "FAILED",

        error,

      },

    });

  }

  /* ============================================================
      READ MODEL SUPPORT
  ============================================================ */

  async findEventsAfterSnapshotVersion(
    aggregateId: string,
    aggregateType: string,
    version: number
  ) {

    return prisma.event.findMany({

      where: {

        aggregateId,

        aggregateType,

        aggregateVersion: {

          gt: version,

        },

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

      where: {

        aggregateId,

        aggregateType,

      },

      orderBy: {

        aggregateVersion: "desc",

      },

    });

  }

}