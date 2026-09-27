import {
    EventBus,
    ProjectionConsumer,
} from "../contracts/EventBus";

import {
    DomainEvent,
} from "@business/shared-types";


export class ProjectionEventBus
    implements EventBus<DomainEvent> {

    private readonly consumers =
        new Set<ProjectionConsumer<DomainEvent>>();


    subscribe(
        consumer: ProjectionConsumer<DomainEvent>
    ): void {

        this.consumers.add(consumer);
    }


    unsubscribe(
        consumer: ProjectionConsumer<DomainEvent>
    ): void {

        this.consumers.delete(consumer);
    }


    getConsumers():
        readonly ProjectionConsumer<DomainEvent>[] {

        return [...this.consumers];
    }


    async publish(
        event: DomainEvent
    ): Promise<void> {

        await this.publishMany([
            event,
        ]);
    }


    async publishMany(
        events: readonly DomainEvent[]
    ): Promise<void> {

        for (const event of events) {

            for (const consumer of this.consumers) {

                await consumer.handle([
                    event,
                ]);
            }
        }
    }
}