import { ProjectionOperationConsumer, EventConsumer } from "./EventSubscriber.js";
/**
 * Consumer capable of both:
 *
 * 1. Live projection execution
 * 2. Projection rebuild operation generation
 *
 * Used by the SQLite/frontend projection system.
 */
export type ProjectionConsumer<TEvent> = EventConsumer<TEvent> & ProjectionOperationConsumer<TEvent>;
/**
 * Live event bus.
 *
 * The bus only needs consumers that know how to
 * execute events immediately.
 *
 * Backend/PostgreSQL consumers implement EventConsumer.
 * Frontend/SQLite consumers may implement ProjectionConsumer.
 */
export interface EventBus<TEvent> {
    publish(event: TEvent): Promise<void>;
    publishMany(events: readonly TEvent[]): Promise<void>;
    subscribe(subscription: EventConsumer<TEvent>): void;
}
/**
 * Observer for projection rebuilds.
 *
 * This is specifically concerned with rebuild execution,
 * not normal live event processing.
 */
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
