import { BackendEvent } from "../modules/sync/repositories/eventRepository.js";
import { DomainEvent } from "@business/shared-types";
export function BackendToDomainEventTransformer(
    event: BackendEvent
): DomainEvent {
    return {
        id: event.id,
        businessId: event.businessId!,
        branchId: event.branchId,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        expectedAggregateVersion: event.aggregateVersion,
        type: event.type,
        mode: event.mode,
        payload: event.payload,
        actor: {
            userId: event.userId,
            deviceId: event.deviceId,
            sessionId: undefined,
        },
        correlationId: event.correlationId!,
        logicClock: Number(event.logicClock),
        causationId: event.causationId!,
        createdAt: event.createdAt.getTime(),
        checksum: event.checksum!,

    };
}