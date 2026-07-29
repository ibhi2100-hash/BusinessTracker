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

export interface ProjectionBus<TEvent>
    extends EventBus<TEvent> {}
export interface ExecutionContextBus<TEvent>
    extends EventBus<TEvent> {}

export interface LedgerBus<TEvent>
    extends EventBus<TEvent> {}

export interface AnalyticsBus<TEvent>
    extends EventBus<TEvent> {}

export interface NotificationBus<TEvent>
    extends EventBus<TEvent> {}
