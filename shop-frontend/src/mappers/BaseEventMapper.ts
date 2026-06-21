import { EventMapper } from "@business/events";
import { BaseEvent, IntegrationEvent } from "@business/shared-types";

export class BaseEventMapper implements 
    EventMapper<BaseEvent, IntegrationEvent>

{
    map(
        event: BaseEvent
    ): IntegrationEvent {
        return {
            id: event.id,
            type: event.type,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            aggregateVersion: event.aggregateVersion,
            payload: event.payload,
            businessId: event.businessId,
            branchId: event.branchId,
            userId: event.userId,
            logicClock: event.logicClock,
            createdAt: event.createdAt

        };
    }

    mapMany(events: BaseEvent<string, Record<string, any>>[]): IntegrationEvent[] {
        return events.map(e => this.map(e))
    }
}