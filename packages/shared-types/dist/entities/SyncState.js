"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEventMapper = void 0;
/**
 * Maps a domain event into the wire format expected by the backend.
 */
class SyncEventMapper {
    static toBackendPayload(event) {
        return {
            id: event.id,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            expectedAggregateVersion: event.expectedAggregateVersion,
            type: event.type,
            mode: event.mode,
            payload: event.payload,
            actor: event.actor,
            causationId: event.causationId,
            correlationId: event.correlationId,
            logicClock: event.logicClock,
            createdAt: event.createdAt,
            checksum: event.checksum,
        };
    }
}
exports.SyncEventMapper = SyncEventMapper;
