import { EventBus, ProjectionConsumer } from "../contracts/EventBus";
import { DomainEvent } from "@business/shared-types";
export declare class ProjectionEventBus implements EventBus<DomainEvent> {
    private readonly consumers;
    subscribe(consumer: ProjectionConsumer<DomainEvent>): void;
    unsubscribe(consumer: ProjectionConsumer<DomainEvent>): void;
    getConsumers(): readonly ProjectionConsumer<DomainEvent>[];
    publish(event: DomainEvent): Promise<void>;
    publishMany(events: readonly DomainEvent[]): Promise<void>;
}
