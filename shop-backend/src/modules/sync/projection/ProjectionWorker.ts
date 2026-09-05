import { ProjectionEventBus } from "@business/event-bus";
import { RepositoryRegistry } from "../repositories/RepositoryRegistry.js";

export class ProjectionWorker {

    constructor(
        private readonly repositories: RepositoryRegistry,
        private readonly projectionBus: ProjectionEventBus
    ) {}


    async processPending(): Promise<void> {

        const pending =
            await this.repositories.outbox
                .getPending(100);


        for (const item of pending) {

            try {

                /*
                 * Load the authoritative event.
                 */

                const event =
                    await this.repositories.events
                        .findById(item.eventId);


                if (!event) {

                    throw new Error(
                        `Event ${item.eventId} ` +
                        `does not exist`
                    );
                }


                /*
                 * Projection handlers should themselves be
                 * idempotent.
                 */

                await this.projectionBus.publish(
                    event
                );


                await this.repositories.outbox
                    .markProcessed(
                        item.id
                    );


            } catch (error) {

                await this.repositories.outbox
                    .markFailed(
                        item.id,
                        error instanceof Error
                            ? error.message
                            : String(error)
                    );
            }
        }
    }
}