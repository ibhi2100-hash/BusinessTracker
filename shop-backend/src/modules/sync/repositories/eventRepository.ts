import type { BackendEvent, DomainEvent } from "@business/shared-types";

import {
    Event,
  Prisma,
  PrismaClient,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { JsonValue } from "@prisma/client/runtime/client";

/**
 * Positions are serialized as decimal strings to preserve BigInt precision
 * across JSON/API boundaries.
 */
export interface AppendEventResult {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  globalPosition: string;
  businessPosition: string;
}

export interface ExistingEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  globalPosition: string;
}

export class DuplicateEventIdError extends Error {
  constructor(eventId: string) {
    super(`Event "${eventId}" already exists.`);
    this.name = "DuplicateEventIdError";
  }
}

export class EventRepository {
  /**
   * Append exactly one event and allocate its per-business stream position.
   *
   * IMPORTANT:
   * - The caller owns the transaction.
   * - The stream counter and event insert must use the same transaction.
   * - Never call this method with the global Prisma client instead of `tx`.
   * - All event-writing paths must follow the same allocation protocol.
   *
   * If insertion fails, the counter increment rolls back with the transaction.
   */
  async append(
    event: DomainEvent,
    aggregateVersion: number,
    tx: Prisma.TransactionClient,
  ): Promise<AppendEventResult> {
    this.validateAppendInput(event, aggregateVersion);

    const businessId = event.businessId;

    // Prevent an accidental duplicate from consuming a position.
    // The event's primary-key constraint remains the final concurrency guard.
    const existing = await tx.event.findUnique({
      where: { id: event.id },
      select: { id: true },
    });

    if (existing) {
      throw new DuplicateEventIdError(event.id);
    }

    /*
     * The upsert atomically allocates the next business stream position.
     *
     * First event for a business: position 1.
     * Subsequent events: previous lastPosition + 1.
     *
     * PostgreSQL serializes concurrent updates to the same counter row.
     * The counter update is rolled back if the surrounding transaction fails.
     */
    const stream = await tx.businessEventStream.upsert({
      where: { businessId },
      create: {
        businessId,
        lastPosition: 1n,
      },
      update: {
        lastPosition: { increment: 1n },
      },
      select: {
        lastPosition: true,
      },
    });

    const businessPosition = stream.lastPosition;

    const data = EventMapper.toCreateInput(event, aggregateVersion);

    const saved = await tx.event.create({
      data: {
        ...data,
        businessPosition,
      },
      select: {
        id: true,
        aggregateId: true,
        aggregateType: true,
        aggregateVersion: true,
        globalPosition: true,
        businessPosition: true,
      },
    });

    return {
      eventId: saved.id,
      aggregateId: saved.aggregateId,
      aggregateType: saved.aggregateType,
      aggregateVersion: saved.aggregateVersion,
      globalPosition: saved.globalPosition.toString(),
      businessPosition: saved.businessPosition.toString(),
    };
  }

  /**
   * Load events for an aggregate whose versions exceed `fromVersion`.
   *
   * Example:
   *   fromVersion = 5
   *   available versions = 1, 2, 3, 4, 5, 6, 7
   *   result versions = 6, 7
   *
   * Use the caller's transaction when this query participates in a larger
   * consistency-sensitive operation.
   */
  async loadAggregateTail(
    aggregateId: string,
    aggregateType: string,
    fromVersion: number,
    tx: Prisma.TransactionClient | PrismaClient = prisma,
  ): Promise<BackendEvent[]> {
    if (!aggregateId.trim()) {
      throw new Error("aggregateId is required.");
    }

    if (!aggregateType.trim()) {
      throw new Error("aggregateType is required.");
    }

    if (!Number.isSafeInteger(fromVersion) || fromVersion < 0) {
      throw new Error("fromVersion must be a non-negative safe integer.");
    }

    const rows = await tx.event.findMany({
      where: {
        aggregateId,
        aggregateType,
        aggregateVersion: {
          gt: fromVersion,
        },
      },
      orderBy: {
        aggregateVersion: "asc",
      },
    });

    return rows.map((row) => EventMapper.fromRow(row));
  }

  /**
   * Read a page of events from a business stream.
   *
   * `checkpoint` is a fixed upper bound captured by the caller within
   * the same consistent read transaction.
   *
   * Fetching limit + 1 lets the caller determine whether another page exists.
   */
  async getEventsAfter(
    tx: Prisma.TransactionClient,
    businessId: string,
    cursor: bigint,
    limit: number,
    checkpoint: bigint,
  ): Promise<Awaited<ReturnType<typeof tx.event.findMany>>> {
    if (!businessId.trim()) {
      throw new Error("businessId is required.");
    }

    if (cursor < 0n) {
      throw new Error("cursor cannot be negative.");
    }

    if (checkpoint < 0n) {
      throw new Error("checkpoint cannot be negative.");
    }

    if (cursor > checkpoint) {
      throw new Error("cursor cannot exceed checkpoint.");
    }

    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 500) {
      throw new Error("limit must be an integer between 1 and 500.");
    }

    return tx.event.findMany({
      where: {
        businessId,
        businessPosition: {
          gt: cursor,
          lte: checkpoint,
        },
      },
      orderBy: {
        businessPosition: "asc",
      },
      take: limit + 1,
    });
  }

  /**
   * Return the latest allocated business stream position.
   *
   * A business with no stream row has no events and starts at position 0.
   */
  async getBusinessPosition(
    tx: Prisma.TransactionClient,
    businessId: string,
  ): Promise<bigint> {
    if (!businessId.trim()) {
      throw new Error("businessId is required.");
    }

    const stream = await tx.businessEventStream.findUnique({
      where: { businessId },
      select: { lastPosition: true },
    });

    return stream?.lastPosition ?? 0n;
  }

  /**
   * Return the highest global position currently present in the event table.
   *
   * Legacy/diagnostic helper only. Do not treat MAX(globalPosition) as a
   * guaranteed commit-order-safe global synchronization checkpoint.
   */
  async getGlobalPosition(
    tx: Prisma.TransactionClient | PrismaClient = prisma,
  ): Promise<bigint> {
    const event = await tx.event.findFirst({
      orderBy: {
        globalPosition: "desc",
      },
      select: {
        globalPosition: true,
      },
    });

    return event?.globalPosition ?? 0n;
  }

  /**
   * Find an event by ID for idempotency/conflict checks.
   *
   * BigInt positions are returned as decimal strings, not JavaScript numbers.
   */
  async findById(eventId: string): Promise<ExistingEvent | null> {
    if (!eventId.trim()) {
      throw new Error("eventId is required.");
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        aggregateId: true,
        aggregateType: true,
        aggregateVersion: true,
        globalPosition: true,
      },
    });

    if (!event) {
      return null;
    }

    return {
      id: event.id,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      aggregateVersion: event.aggregateVersion,
      globalPosition: event.globalPosition.toString(),
    };
  }

  /**
   * Retrieve the complete backend event representation.
   */
  async getById(
    eventId: string,
    tx: Prisma.TransactionClient | PrismaClient = prisma,
  ): Promise<BackendEvent | null> {
    if (!eventId.trim()) {
      throw new Error("eventId is required.");
    }

    const row = await tx.event.findUnique({
      where: { id: eventId },
    });

    return row ? EventMapper.fromRow(row) : null;
  }

  private validateAppendInput(
    event: DomainEvent,
    aggregateVersion: number,
  ): void {
    if (!event.id?.trim()) {
      throw new Error("Event id is required.");
    }

    if (!event.businessId?.trim()) {
      throw new Error("Cannot append an event without businessId.");
    }

    if (!event.aggregateId?.trim()) {
      throw new Error("Event aggregateId is required.");
    }

    if (!event.aggregateType?.trim()) {
      throw new Error("Event aggregateType is required.");
    }

    if (!Number.isSafeInteger(aggregateVersion) || aggregateVersion < 1) {
      throw new Error(
        "aggregateVersion must be a positive safe integer.",
      );
    }

    if (
      event.logicClock === undefined ||
      event.logicClock === null ||
      !/^\d+$/.test(String(event.logicClock))
    ) {
      throw new Error("logicClock must be a non-negative integer.");
    }

    const createdAt = new Date(event.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      throw new Error("Event createdAt must be a valid date.");
    }
  }
}


export class EventMapper {

    private static toJsonValue(
        value: unknown
    ): JsonValue {

        if (
            value === null ||
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        ) {
            return value;
        }

        if (typeof value === "bigint") {
            throw new Error(
                "BigInt cannot be stored inside an event payload"
            );
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (Array.isArray(value)) {
            return value.map(
                EventMapper.toJsonValue
            );
        }

        if (typeof value === "object") {

            const result: {
                [key: string]: JsonValue;
            } = {};

            for (
                const [key, child] of Object.entries(value)
            ) {
                result[key] =
                    EventMapper.toJsonValue(child);
            }

            return result;
        }

        throw new Error(
            `Unsupported event payload value: ${typeof value}`
        );
    }


    private static toPayload(
        payload: unknown
    ): Prisma.InputJsonValue {

        const value =
            EventMapper.toJsonValue(payload);

        if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            throw new Error(
                "Event payload must be a JSON object"
            );
        }

        return value as Prisma.InputJsonValue;
    }


    static toCreateInput(
        event: DomainEvent,
        aggregateVersion: number
    ): Prisma.EventCreateInput {

        return {

            id: event.id,

            businessId:
                event.businessId,

            branchId:
                event.branchId,

            aggregateId:
                event.aggregateId,

            aggregateType:
                event.aggregateType,

            aggregateVersion,

            type:
                event.type,

            payload:
                EventMapper.toPayload(
                    event.payload
                ),

            mode:
                event.mode,

            userId:
                event.actor.userId,

            deviceId:
                event.actor.deviceId,

            causationId:
                event.causationId,

            correlationId:
                event.correlationId,

            logicClock:
                BigInt(event.logicClock),

            checksum:
                event.checksum,

            createdAt:
                new Date(event.createdAt),
        };
    }


    static toUpsertArgs(
        event: DomainEvent,
        aggregateVersion: number
    ): Prisma.EventUpsertArgs {

        return {

            where: {
                id: event.id,
            },

            create:
                EventMapper.toCreateInput(
                    event,
                    aggregateVersion
                ),

            update: {},
        };
    }


    static fromRow(
        row: Event
    ): BackendEvent {

        return {

            id: row.id,

            businessId:
                row.businessId,

            branchId:
                row.branchId,

            aggregateId:
                row.aggregateId,

            aggregateType:
                row.aggregateType,

            aggregateVersion:
                row.aggregateVersion,

            globalPosition:
                row.globalPosition,

            type:
                row.type,

            payload:
                row.payload,

            mode:
                row.mode as Mode,

            userId:
                row.userId,

            deviceId:
                row.deviceId,

            causationId:
                row.causationId,

            correlationId:
                row.correlationId,

            logicClock:
                row.logicClock,

            checksum:
                row.checksum,

            createdAt:
                row.createdAt,
        };
    }
}