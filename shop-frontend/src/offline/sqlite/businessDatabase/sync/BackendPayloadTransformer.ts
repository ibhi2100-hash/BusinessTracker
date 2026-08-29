import { DomainEvent } from "@business/shared-types";
import { BackendEventPayload } from "./types";
import { OutboxRow } from "../repositories/SQLiteOutboxRepository/SQLiteOutboxRepository";


export function toBackendPayload<TPayload>(
    event: DomainEvent<TPayload>
): BackendEventPayload<TPayload> {

    return {
        id: event.id,

        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,

        expectedAggregateVersion:
            event.expectedAggregateVersion,

        type: event.type,
        mode: event.mode,

        payload: event.payload,

        actor: {
            userId: event.actor.userId,
            deviceId: event.actor.deviceId,
            sessionId: event.actor.sessionId,
        },

        causationId: event.causationId,

        logicClock: event.logicClock,

        createdAt: event.createdAt,

        checksum: event.checksum,
    };
}


function rowToDomainEvent(row: OutboxRow): DomainEvent {
  return {
    id: row.id as string,                    // events.id
    businessId: row.businessId as string | undefined,
    branchId: row.branchId as string | undefined,
    aggregateId: row.aggregateId as string,
    aggregateType: row.aggregateType as string,
    aggregateVersion: row.aggregateVersion as number | undefined,
    expectedAggregateVersion: row.expectedAggregateVersion as number,
    type: row.type as string,
    mode: row.mode as "OPENING" | "LIVE",
    payload: row.payload as unknown,
    actor: {
      userId: row.userId as string,          // or however you store actor
      deviceId: row.deviceId as string,
      sessionId: row.sessionId as string | undefined,
    },
    causationId: row.causationId as string,
    logicClock: row.logicClock as number,
    createdAt: row.createdAt as number,
    checksum: row.checksum as string | undefined,
  };
}