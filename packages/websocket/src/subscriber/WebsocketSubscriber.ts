import { EventSubscriber } from "@business/event-bus";
import { BaseEvent, IntegrationEvent } from "@business/shared-types";

export class WebSocketSubscriber implements EventSubscriber<IntegrationEvent> {

    async handle(events: IntegrationEvent[]): Promise<void> {
        
    }
}