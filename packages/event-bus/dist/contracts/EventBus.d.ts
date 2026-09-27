import { ProjectionOperationConsumer, EventConsumer } from "./EventSubscriber";
export type ProjectionConsumer<TEvent> = EventConsumer<TEvent> & ProjectionOperationConsumer<TEvent>;
export interface EventBus<TEvent> {
    publish(event: TEvent): Promise<void>;
    publishMany(events: readonly TEvent[]): Promise<void>;
    subscribe(subscription: ProjectionConsumer<TEvent>): void;
}
export interface RebuildObserver<TEvent> {
    onStarted(): void;
    onRebuildStarted(totalEvents: number): void;
    onResetStarted(): void;
    onResetCompleted(): void;
    onEventsLoaded(events: readonly TEvent[]): void;
    onEventStarted(event: TEvent): void;
    onConsumerStarted(consumer: ProjectionConsumer<TEvent>, event: TEvent): void;
    onConsumerCompleted(consumer: ProjectionConsumer<TEvent>, event: TEvent, duration: number): void;
    onConsumerFailed(consumer: ProjectionConsumer<TEvent>, event: TEvent, error: unknown): void;
    onEventCompleted(event: TEvent): void;
    onProjectionUpdated(projection: string, rows: number, position: number): void;
    onCommitStarted(): void;
    onCompleted(): void;
    onFailed(error: unknown): void;
}
