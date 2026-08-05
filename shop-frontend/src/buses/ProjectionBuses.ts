import {
    EventBus,
    EventConsumer
} from "@business/event-bus";

import { DomainEvent } from "@business/shared-types";

export class ProjectionEventBus
    implements EventBus<DomainEvent<unknown>>
{
    private readonly consumers = new Set<
        EventConsumer<DomainEvent<unknown>>
    >();

    subscribe(
        consumer: EventConsumer<DomainEvent<unknown>>
    ): void {
        this.consumers.add(consumer);
    }

    unsubscribe(
        consumer: EventConsumer<DomainEvent<unknown>>
    ): void {
        this.consumers.delete(consumer);
    }

    async publish(
        event: DomainEvent<unknown>
    ): Promise<void> {
        await this.publishMany([event]);
    }

    async publishMany(
        events: readonly DomainEvent<unknown>[]
    ): Promise<void> {

        await Promise.allSettled(
            [...this.consumers].map(consumer =>
                this.safeHandle(
                    consumer,
                    events
                )
            )
        );
    }

    private async safeHandle(
        consumer: EventConsumer<DomainEvent<unknown>>,
        events: readonly DomainEvent<unknown>[]
    ): Promise<void> {
        try {
            await consumer.handle(events);
        } catch (error) {
            console.error(
                "[ClientEventBus]",
                consumer.constructor.name,
                error
            );
        }
    }
}