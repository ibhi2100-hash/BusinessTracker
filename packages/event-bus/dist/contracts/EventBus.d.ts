import { EventConsumer } from "./EventSubscriber";
export interface EventBus<TEvent> {
    publish(event: TEvent): Promise<void>;
    publishMany(events: readonly TEvent[]): Promise<void>;
    subscribe(subscription: EventConsumer<TEvent>): void;
}
export interface RebuildObserver<TEvent> {
    onStarted(): void;
    onRebuildStarted(totalEvents: number): void;
    onResetStarted(): void;
    onResetCompleted(): void;
    onEventsLoaded(events: readonly TEvent[]): void;
    onEventStarted(event: TEvent): void;
    onConsumerStarted(consumer: EventConsumer<TEvent>, event: TEvent): void;
    onConsumerCompleted(consumer: EventConsumer<TEvent>, event: TEvent, duration: number): void;
    onConsumerFailed(consumer: EventConsumer<TEvent>, event: TEvent, error: string): void;
    onEventCompleted(event: TEvent): void;
    onProjectionUpdated(projection: string, rows: number, position: number): void;
    onCommitStarted(): void;
    onCompleted(): void;
    onFailed(error: unknown): void;
}
