import { SQLiteEventRepository } from "../../repositories/SQLiteEventRepository/eventStore";
import { ProjectionEventBus } from "@/src/buses/ProjectionBuses";
import { ProjectionResetter } from "./ProjectionResetterContract";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { ProjectionRebuildOptions, ProjectionRebuildResult } from "./types";
import { RebuildObserver } from "@business/event-bus";

export class ProjectionRebuilder {
    constructor(
        private readonly transaction: TransactionManager,
        private readonly eventStore: SQLiteEventRepository,
        private readonly projectionBus: ProjectionEventBus,
        private readonly projectionResetter: ProjectionResetter
    ){}

    async rebuildAll(): Promise<void> {
        await this.projectionResetter.resetAll()

        const events = await this.eventStore.loadAllEvents();

       for (const event of events) {
        await this.projectionBus.publish(event)
       }
    }

    async rebuild(
        options: ProjectionRebuildOptions = {},
        observer: RebuildObserver
    ): Promise<ProjectionRebuildResult> {

        const startedAt = Date.now();

        let eventsProcessed = 0;
        let lastPosition = 0;

        try {

            await observer.onStarted();

            await this.transaction.run(
                async () => {

                    await observer.onResetStarted();

                    await this.projectionResetter.resetAll();

                    await observer.onResetCompleted();

                    for await (
                        const batch
                        of this.eventStore.stream(options)
                    ) {

                        for (
                            const event
                            of batch
                        ) {

                            await this.projectionBus.replay(
                                event,
                                observer
                            );

                            eventsProcessed++;

                            lastPosition =
                                event.globalPosition;
                        }
                    }

                    await observer.onCommitStarted();
                }
            );

            await observer.onCompleted();

            return {
                eventsProcessed,

                fromPosition:
                    options.fromPosition ?? 0,

                toPosition:
                    lastPosition,

                durationMs:
                    Date.now() - startedAt
            };

        } catch (error) {

            await observer.onFailed(
                error
            );

            throw error;
        }

    }
}
