import { DomainEvent } from "@business/shared-types";
import { EventConsumer } from "./EventSubscriber";
export interface EventBus<TEvent> {
    publish(event: TEvent): Promise<void>;
    publishMany(events: readonly TEvent[]): Promise<void>;
    subscribe(subscription: EventConsumer<TEvent>): void;
}
export interface RebuildObserver {
    onStarted(): void;
    onResetStarted(): void;
    onResetCompleted(): void;
    onEventsLoaded(events: readonly DomainEvent[]): void;
    onEventStarted(event: DomainEvent): void;
    onConsumerStarted(consumer: string, event: DomainEvent): void;
    onConsumerCompleted(consumer: string, event: DomainEvent, duration: number): void;
    onConsumerFailed(consumer: string, event: DomainEvent, error: string): void;
    onEventCompleted(event: DomainEvent): void;
    onProjectionUpdated(projection: string, rows: number, position: number): void;
    onCommitStarted(): void;
    onCompleted(): void;
    onFailed(error: unknown): void;
}
