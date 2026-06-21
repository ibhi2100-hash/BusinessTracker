import { IntegrationEvent } from "@business/shared-types";
import { EventBus } from "../contracts/EventBus";
import { EventSubscriber } from "../contracts/EventSubscriber";
export declare class InMemoryEventBus implements EventBus {
    private readonly subscribers;
    subscribe(subscriber: EventSubscriber): void;
    publish(events: IntegrationEvent[]): Promise<void>;
}
