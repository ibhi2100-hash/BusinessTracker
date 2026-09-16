import { DomainEvent, Mode } from "@business/shared-types";
import {
  Event,
  Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { BackendEvent } from "@business/shared-types";


export interface AppendEventResult {
    eventId: string;

    aggregateId: string;
    aggregateType: string;

    aggregateVersion: number;
    globalPosition: number;
}

export interface ExistingEvent {
    id: string;

    aggregateId: string;
    aggregateType: string;

    aggregateVersion: number;
    globalPosition: number;
}

export class EventRepository {
  async append(
  event: DomainEvent,
  aggregateVersion: number,
  tx: Prisma.TransactionClient
): Promise<AppendEventResult> {

  const data =
    EventMapper.toCreateInput(
      event,
      aggregateVersion
    );

  const saved =
    await tx.event.create({
      data,

      select: {
        id: true,
        aggregateId: true,
        aggregateType: true,
        aggregateVersion: true,
        globalPosition: true,
      },
    });

  return {
    eventId: saved.id,

    aggregateId:
      saved.aggregateId,

    aggregateType:
      saved.aggregateType,

    aggregateVersion:
      saved.aggregateVersion,

    globalPosition:
      Number(saved.globalPosition),
  };
}

  /**
   * Returns the authoritative server events that occurred
   * AFTER the supplied aggregate version.
   *
   * Example:
   * fromVersion = 5
   * server aggregate versions = 1..8
   *
   * returns: 6, 7, 8
   */
  async loadAggregateTail(
    aggregateId: string,
    aggregateType: string,
    fromVersion: number,
    tx: Prisma.TransactionClient = prisma
  ): Promise<BackendEvent[]> {
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

    return rows.map(EventMapper.fromRow);
  }

  async getGlobalPosition(
    tx: Prisma.TransactionClient = prisma
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

  async findById(
    eventId: string,
  ): Promise<ExistingEvent | null> {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId
      },
      select: {
        id: true,
        aggregateId: true,
        aggregateType: true,
        aggregateVersion: true,
        globalPosition: true
      }
    });

    return event
      ? {
          ...event,
          globalPosition: Number(event.globalPosition),
        }
      : null;
  }

  async getById(
    eventId: string,
    tx: Prisma.TransactionClient = prisma
): Promise<BackendEvent | null> {

    const row = await tx.event.findUnique({
        where: {
            id: eventId,
        },
    });

    if (!row) {
        return null;
    }

    return EventMapper.fromRow(row);
}
}
type JsonPrimitive =
    | string
    | number
    | boolean
    | null;

type JsonValue =
    | JsonPrimitive
    | JsonValue[]
    | {
        [key: string]: JsonValue;
    };


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