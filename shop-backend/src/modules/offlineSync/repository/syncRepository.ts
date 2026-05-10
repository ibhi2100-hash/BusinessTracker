// sync.repository.ts

import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

import { Event as DomainEvent } from "../../../domain/event.js";

import { getEventScope } from "../../../helpers/eventScope.js";
import { branchRelationData } from "../../../helpers/branchRelation.js";

export class SyncRepository {

  /* =========================================================
     IDEMPOTENCY
  ========================================================= */

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

  async assertEventIntegrity(
    incoming: DomainEvent,
    existing: any
  ) {

    const existingPayload =
      JSON.stringify(existing.payload);

    const incomingPayload =
      JSON.stringify(incoming.payload);

    if (
      existingPayload !== incomingPayload
    ) {
      throw new Error(
        `EVENT_ID_COLLISION: ${incoming.id}`
      );
    }
  }

  /* =========================================================
     REPLICA CLOCK VALIDATION
     IMPORTANT:
     - ONLY FOR DEDUPLICATION
     - NOT FOR STRICT SEQUENTIAL ORDERING
  ========================================================= */

  async validateReplicaClock(
    event: DomainEvent,
    tx: Prisma.TransactionClient
  ) {

    const duplicateClock =
      await tx.event.findFirst({
        where: {
          deviceId: event.deviceId,
          logicClock: event.logicClock,
        },
      });

    if (duplicateClock) {

      if (duplicateClock.id === event.id) {
        return;
      }

      throw new Error(
        `DUPLICATE_REPLICA_CLOCK: device=${event.deviceId} clock=${event.logicClock}`
      );
    }
  }

  /* =========================================================
     AGGREGATE VERSION LOOKUP
  ========================================================= */

  async getLastAggregateEvent(
    aggregateId: string,
    aggregateType: string,
    tx: Prisma.TransactionClient
  ) {
    return tx.event.findFirst({
      where: {
        aggregateId,
        aggregateType,
      },
      orderBy: {
        aggregateVersion: "desc",
      },
    });
  }

  /* =========================================================
     MAIN STORE EVENT
  ========================================================= */

  async storeEvent(
    event: DomainEvent,
    tx: Prisma.TransactionClient
  ) {

    /* -----------------------------------------------------
       STEP 1 — IDEMPOTENCY CHECK
    ----------------------------------------------------- */

    const existing =
      await this.findExistingEvent(
        event.id,
        tx
      );

    if (existing) {

      await this.assertEventIntegrity(
        event,
        existing
      );

      return existing;
    }

    /* -----------------------------------------------------
       STEP 2 — REPLICA CLOCK VALIDATION
    ----------------------------------------------------- */

    await this.validateReplicaClock(
      event,
      tx
    );

    /* -----------------------------------------------------
       STEP 3 — OCC + RETRY LOOP
    ----------------------------------------------------- */

    for (let retry = 0; retry < 5; retry++) {

      const lastEvent =
        await this.getLastAggregateEvent(
          event.aggregateId,
          event.aggregateType,
          tx
        );

      const currentVersion =
        lastEvent?.aggregateVersion ?? 0;

      const aggregateExists =
        !!lastEvent;

      /* -------------------------------------------------
         CREATION SEMANTICS
      ------------------------------------------------- */

      if (
        !aggregateExists &&
        !event.isCreationEvent
      ) {
        throw new Error(
          `AGGREGATE_NOT_FOUND aggregateId=${event.aggregateId}`
        );
      }

      if (
        aggregateExists &&
        event.isCreationEvent
      ) {
        throw new Error(
          `AGGREGATE_ALREADY_EXISTS aggregateId=${event.aggregateId}`
        );
      }

      /* -------------------------------------------------
         OPTIMISTIC CONCURRENCY
      ------------------------------------------------- */

      if (
        currentVersion !==
        event.expectedAggregateVersion
      ) {
        throw new Error(
          `VERSION_CONFLICT aggregateId=${event.aggregateId} expected=${event.expectedAggregateVersion} current=${currentVersion}`
        );
      }

      const nextVersion =
        currentVersion + 1;

      try {

        const saved =
          await tx.event.create({
            data: {

              /* ---------------------------------------
                 IDENTIFIERS
              --------------------------------------- */

              id: event.id,

              aggregateId:
                event.aggregateId,

              aggregateType:
                event.aggregateType,

              aggregateVersion:
                nextVersion,

              /* ---------------------------------------
                 EVENT
              --------------------------------------- */

              type: event.type,

              payload: event.payload,

              /* ---------------------------------------
                 SCOPE
              --------------------------------------- */

              scope:
                getEventScope(event),

              mode:
                event.mode,

              /* ---------------------------------------
                 BUSINESS RELATIONS
              --------------------------------------- */

              businessId:
                event.businessId ?? null,

              ...branchRelationData(event),

              /* ---------------------------------------
                 REPLICA METADATA
              --------------------------------------- */

              logicClock:
                event.logicClock,

              deviceId:
                event.deviceId,

              /* ---------------------------------------
                 USER
              --------------------------------------- */

              userId:
                event.userId ?? null,

              /* ---------------------------------------
                 SYNC STATE
              --------------------------------------- */

              status: "SYNCED",

              synced: true,

              /* ---------------------------------------
                 CREATED
              --------------------------------------- */

              createdAt:
                new Date(event.createdAt),
            },
          });

        return saved;

      } catch (err: any) {

        /* ---------------------------------------------
           VERSION COLLISION
        --------------------------------------------- */

        if (err.code === "P2002") {
          continue;
        }

        throw err;
      }
    }

    throw new Error(
      `FAILED_TO_ASSIGN_AGGREGATE_VERSION aggregateId=${event.aggregateId}`
    );
  }

  /* =========================================================
     PROCESSED EVENT TRACKING
  ========================================================= */

  async markProcessed(
    savedEvent: any,
    tx: Prisma.TransactionClient
  ) {

    return tx.processedSyncEvent.upsert({
      where: {
        id: savedEvent.id,
      },

      update: {
        status: "SYNCED",
        error: null,
        version:
          savedEvent.aggregateVersion,
      },

      create: {

        id: savedEvent.id,

        eventType:
          savedEvent.type,

        businessId:
          savedEvent.businessId,

        branchId:
          savedEvent.branchId,

        branchBusinessId:
          savedEvent.branchBusinessId,

        userId:
          savedEvent.userId,

        version:
          savedEvent.aggregateVersion,

        status: "SYNCED",
      },
    });
  }

  /* =========================================================
     FAILED EVENTS
  ========================================================= */

  async markFailed(
    event: DomainEvent,
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
          event.businessId ?? null,

        userId:
          event.userId ?? null,

        version:
          event.expectedAggregateVersion ?? null,

        status: "FAILED",

        error,
      },
    });
  }

  /* =========================================================
     SNAPSHOT EVENT FETCH
  ========================================================= */

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
}