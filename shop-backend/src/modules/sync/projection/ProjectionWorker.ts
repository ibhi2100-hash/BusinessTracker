import { ProjectionEventBus } from "@business/event-bus";
import { RepositoryRegistry } from "../repositories/RepositoryRegistry.js";
import { BackendToDomainEventTransformer } from "../../../lib/BackendEventTransformer.js";

export class ProjectionWorker {

    constructor(
        private readonly repositories: RepositoryRegistry,
        private readonly projectionBus: ProjectionEventBus
    ) {}


    async processPending(): Promise<void> {

        const pending =
            await this.repositories
                .outbox
                .getPending(100);

        console.log(
            "[PROJECTION WORKER] Processing pending events...",
            pending.length
        );


        for (const item of pending) {

            try {

                console.log(
                    "[PROJECTION] Processing outbox:",
                    {
                        eventId: item.eventId,
                        aggregateId: item.aggregateId,
                        aggregateType: item.aggregateType,
                        aggregateVersion:
                            item.aggregateVersion,
                        globalPosition:
                            item.globalPosition,
                    }
                );


                /*
                 * =================================================
                 * LOAD AUTHORITATIVE EVENT
                 * =================================================
                 */

                const event =
                    await this.repositories
                        .events
                        .getById(item.eventId);


                if (!event) {

                    throw new Error(
                        `Event ${item.eventId} does not exist`
                    );
                }


                /*
                 * =================================================
                 * PUBLISH TO PROJECTIONS
                 * =================================================
                 */

                const domainEvent = BackendToDomainEventTransformer(event);

                await this.projectionBus.publish(
                    domainEvent
                );


                /*
                 * =================================================
                 * MARK OUTBOX PROCESSED
                 * =================================================
                 */

                await this.repositories
                    .outbox
                    .markProcessed(
                        item.eventId
                    );


                console.log(
                    "[PROJECTION] Processed:",
                    {
                        eventId: event.id,
                        globalPosition:
                            event.globalPosition,
                    }
                );


            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : String(error);


                console.error(
                    "[PROJECTION] Failed:",
                    {
                        outboxId: item.eventId,
                        eventId: item.eventId,
                        error: message,
                    }
                );


                await this.repositories
                    .outbox
                    .markFailed(
                        item.eventId,
                        message
                    );
            }
        }
    }
}