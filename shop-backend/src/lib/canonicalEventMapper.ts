import { EventMapper } from "@business/events";
import { CanonicalEvent, DomainEvent } from "@business/shared-types";

export class CanonicalMapper

{
    map(
        event: CanonicalEvent
    ) {
        return {
            id: event.id,
            type: event.type,
            mode: event.mode,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            aggregateVersion: event.aggregateVersion,
            payload: event.payload,
            businessId: event.businessId,
            branchId: event.branchId,
            userId: event.userId,
            createdAt: event.occurredAt,
        };
    }

   
}