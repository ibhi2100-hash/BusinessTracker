import { EventBus } from "../contracts/EventBus";
import { EventConsumer } from "../contracts/EventSubscriber";
import { DomainEvent } from "@business/shared-types";
export declare class ProjectionEventBus implements EventBus<DomainEvent> {
    private readonly consumers;
    subscribe(consumer: EventConsumer<DomainEvent>): void;
    unsubscribe(consumer: EventConsumer<DomainEvent>): void;
    getConsumers(): readonly EventConsumer<DomainEvent>[];
    publish(event: DomainEvent): Promise<void>;
    publishMany(events: readonly DomainEvent[]): Promise<void>;
}
