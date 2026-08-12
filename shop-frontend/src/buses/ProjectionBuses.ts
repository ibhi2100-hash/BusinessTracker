import {
    EventBus,
    EventConsumer
} from "@business/event-bus";

import { DomainEvent } from "@business/shared-types";

export class ProjectionEventBus
implements EventBus<DomainEvent> {

    private readonly consumers =
        new Set<EventConsumer<DomainEvent>>();

    subscribe(
        consumer: EventConsumer<DomainEvent>
    ): void {
        this.consumers.add(consumer);
    }

    unsubscribe(
        consumer: EventConsumer<DomainEvent>
    ): void {
        this.consumers.delete(consumer);
    }

    getConsumers(): readonly EventConsumer<DomainEvent>[]{
        return [...this.consumers]
    }


    async publish(
        event: DomainEvent
    ): Promise<void> {
        await this.publishMany([event]);
    }

    async publishMany(
        events: readonly DomainEvent[]
    ): Promise<void> {
        const startedAt = Date.now()
        for (const event of events) {

            for (const consumer of this.consumers) {

                try {

                    await consumer.handle([event]);

                } catch (error) {

                    throw error;
                }
            }
        }
    }
}