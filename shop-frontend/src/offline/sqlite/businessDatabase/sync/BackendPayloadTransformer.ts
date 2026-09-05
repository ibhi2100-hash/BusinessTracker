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

        correlationId: event.correlationId,

        logicClock: event.logicClock,

        createdAt: event.createdAt,

        checksum: event.checksum,
    };
}