import { EventSubscriber } from "./EventSubscriber";

export interface EventBus<TEvent> {

    publish(
        event: TEvent
    ): Promise<void>;

    publishMany(
        events: TEvent[]
    ): Promise<void>

    subscribe(
        subscriber: EventSubscriber<TEvent>
    ): void
}
