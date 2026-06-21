import { EventBus } from "../contracts/EventBus";
import { EventSubscriber } from "../contracts/EventSubscriber";
export declare class InMemoryEventBus<TEvent> implements EventBus<TEvent> {
    private subscribers;
    subscribe(subscriber: EventSubscriber<TEvent>): void;
    publish(event: TEvent): Promise<void>;
    publishMany(events: TEvent[]): Promise<void>;
    private safeHandle;
}
