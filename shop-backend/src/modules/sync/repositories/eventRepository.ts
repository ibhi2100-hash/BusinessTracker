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

        const saved = await tx.event.create({
            data: {
                id: event.id,

                aggregateId:
                    event.aggregateId,

                aggregateType:
                    event.aggregateType,

                aggregateVersion,

                type:
                    event.type,

                mode:
                    event.mode,

                payload:
                    event.payload,

                businessId:
                    event.businessId,

                branchId:
                    event.branchId,

                userId: event.actor.userId,
                deviceId: event.actor.deviceId,

                causationId:
                    event.causationId,

                correlationId:
                    event.correlationId,

                logicClock:
                    event.logicClock,

                createdAt:
                    new Date(event.createdAt),

                checksum:
                    event.checksum,
            },

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

class EventMapper {
  static toUpsertArgs(
    event: DomainEvent,
    aggregateVersion: number
  ): Prisma.EventUpsertArgs {
    const data: Prisma.EventCreateInput = {
      id: event.id,

      businessId: event.businessId,
      branchId: event.branchId,

      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,

      aggregateVersion,

      type: event.type,

      payload: event.payload as Prisma.InputJsonValue,

      mode: event.mode,

      userId: event.actor.userId,
      deviceId: event.actor.deviceId,

      causationId: event.causationId,

      correlationId: event.correlationId,

      logicClock: BigInt(event.logicClock),

      checksum: event.checksum,

      createdAt: new Date(event.createdAt),
    };

    return {
      where: {
        id: event.id,
      },

      create: data,

      update: {},
    };
  }

  static fromRow(row: Event): BackendEvent {
    return {
      id: row.id,

      businessId: row.businessId,
      branchId: row.branchId,

      aggregateId: row.aggregateId,
      aggregateType: row.aggregateType,

      aggregateVersion: row.aggregateVersion,
      globalPosition: row.globalPosition,

      type: row.type,
      payload: row.payload,

      mode: row.mode as Mode,

      userId: row.userId,
      deviceId: row.deviceId,

      causationId: row.causationId,
      correlationId: row.correlationId,

      logicClock: row.logicClock,

      checksum: row.checksum,

      createdAt: row.createdAt,
    };
  }
}