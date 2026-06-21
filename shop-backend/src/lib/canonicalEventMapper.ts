import { EventMapper } from "@business/events";
import { CanonicalEvent, IntegrationEvent } from "@business/shared-types";

export class CanonicalMapper implements 
    EventMapper<CanonicalEvent, IntegrationEvent>

{
    map(
        event: CanonicalEvent
    ): IntegrationEvent {
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
            createdAt: event.createdAt,
        };
    }

    mapMany(events: CanonicalEvent[]): IntegrationEvent[] {
        return events.map(e => this.map(e))
    }
}