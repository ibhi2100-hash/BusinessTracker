import { DomainEvent, Mode } from "@business/shared-types";
import {
  Event,
  Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

export interface BackendEvent {
  id: string;

  businessId?: string;
  branchId?: string;

  aggregateId: string;
  aggregateType: string;

  aggregateVersion: number;
  globalPosition: bigint;

  type: string;
  payload: unknown;

  mode: Mode;

  userId: string;
  deviceId: string;

  causationId?: string;
  correlationId?: string;

  logicClock: bigint;

  checksum?: string;

  createdAt: Date;
}

export class EventRepository {
  async append(
    event: DomainEvent,
    aggregateVersion: number,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    await tx.event.upsert(
      EventMapper.toUpsertArgs(event, aggregateVersion)
    );
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

      correlationId: event.causationId,

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

      businessId: row.businessId ?? undefined,
      branchId: row.branchId ?? undefined,

      aggregateId: row.aggregateId,
      aggregateType: row.aggregateType,

      aggregateVersion: row.aggregateVersion,
      globalPosition: row.globalPosition,

      type: row.type,
      payload: row.payload,

      mode: row.mode as Mode,

      userId: row.userId,
      deviceId: row.deviceId,

      causationId: row.causationId ?? undefined,
      correlationId: row.correlationId ?? undefined,

      logicClock: row.logicClock,

      checksum: row.checksum ?? undefined,

      createdAt: row.createdAt,
    };
  }
}