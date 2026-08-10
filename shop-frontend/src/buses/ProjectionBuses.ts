import {
    EventBus,
    EventConsumer,
    RebuildObserver
} from "@business/event-bus";

import { DomainEvent } from "@business/shared-types";

export class ProjectionEventBus
implements EventBus<DomainEvent>
{
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

    async publish(
        event: DomainEvent
    ): Promise<void> {

        await this.publishMany([event]);
    }

    async publishMany(
        events: readonly DomainEvent[]
    ): Promise<void> {

        for (const event of events) {

            for (const consumer of this.consumers) {

                await consumer.handle([
                    event
                ]);
            }
        }
    }

    async replay(
        event: DomainEvent,
        observer: RebuildObserver
    ): Promise<void> {

        await observer.onEventStarted(
            event
        );

        for (
            const consumer
            of this.consumers
        ) {

            const consumerName =
                consumer.constructor.name;

            const startedAt =
                Date.now();

            await observer.onConsumerStarted(
                consumerName,
                event
            );

            try {

                await consumer.handle([
                    event
                ]);

                await observer.onConsumerCompleted(
                    consumerName,
                    event,
                    Date.now() - startedAt
                );

            } catch (error) {

                await observer.onConsumerFailed(
                    consumerName,
                    event,
                    error
                );

                throw error;
            }
        }

        await observer.onEventCompleted(
            event
        );
    }
}