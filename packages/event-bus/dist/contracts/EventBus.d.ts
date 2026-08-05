import { EventConsumer } from "./EventSubscriber";
export interface EventBus<TEvent> {
    publish(event: TEvent): Promise<void>;
    publishMany(events: readonly TEvent[]): Promise<void>;
    subscribe(subscription: EventConsumer<TEvent>): void;
}
