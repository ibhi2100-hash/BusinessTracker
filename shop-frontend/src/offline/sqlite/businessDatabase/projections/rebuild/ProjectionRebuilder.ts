import {
    SQLiteEventRepository,
} from "../../repositories/SQLiteEventRepository/eventStore";

import {
    ProjectionEventBus,
    RebuildObserver,
} from "@business/event-bus";

import {
    ProjectionResetter,
} from "./ProjectionResetterContract";

import {
    TransactionManager,
} from "@/src/storage/transaction/TransactionManager";

import {
    ProjectionRebuildOptions,
    ProjectionRebuildResult,
} from "./types";

import {
    DomainEvent,
} from "@business/shared-types";

import type {
    SQLiteStatementOperation,
} from "@/src/storage/statement/worker/WorkerProtocol";


export class ProjectionRebuilder {

    constructor(
        private readonly transaction: TransactionManager,
        private readonly eventStore: SQLiteEventRepository,
        private readonly projectionBus: ProjectionEventBus,
        private readonly projectionResetter: ProjectionResetter,
        private readonly observer: RebuildObserver<DomainEvent>
    ) {}

    async rebuild(
        options: ProjectionRebuildOptions = {}
    ): Promise<ProjectionRebuildResult> {

        const startedAt = Date.now();

        let eventsProcessed = 0;

        let lastLogicClock =
            options.fromLogicalClock ?? 0;

        try {

            await this.observer.onStarted?.();


            // =================================================
            // RESET PROJECTIONS
            // =================================================

            await this.observer.onResetStarted?.();

            const resetOperations =
                this.projectionResetter.resetOperations();

            await this.transaction.run(
                resetOperations
            );

            await this.observer.onResetCompleted?.();


            // =================================================
            // REBUILD FROM EVENT STORE
            // =================================================

            for await (
                const batch
                of this.eventStore.stream(options)
            ) {

                const operations:
                    SQLiteStatementOperation[] = [];


                // =============================================
                // BUILD BATCH PROJECTION OPERATIONS
                // =============================================

                for (const event of batch) {

                    await this.observer.onEventStarted?.(
                        event
                    );


                    for (
                        const consumer
                        of this.projectionBus.getConsumers()
                    ) {

                        const consumerStarted =
                            Date.now();

                        await this.observer.onConsumerStarted?.(
                            consumer,
                            event
                        );


                        try {

                            const consumerOperations =
                                consumer.buildOperations([
                                    event,
                                ]);

                            operations.push(
                                ...consumerOperations
                            );


                            await this.observer.onConsumerCompleted?.(
                                consumer,
                                event,
                                Date.now() -
                                consumerStarted
                            );

                        } catch (error) {

                            await this.observer.onConsumerFailed?.(
                                consumer,
                                event,
                                error
                            );

                            throw error;
                        }
                    }


                    eventsProcessed++;

                    lastLogicClock =
                        event.logicClock;

                    await this.observer.onEventCompleted?.(
                        event
                    );
                }


                // =============================================
                // ATOMIC BATCH COMMIT
                // =============================================

                if (operations.length > 0) {

                    await this.transaction.run(
                        operations
                    );
                }
            }


            // =================================================
            // RESULT
            // =================================================

            const result: ProjectionRebuildResult = {

                eventsProcessed,

                fromLogicClock:
                    options.fromLogicalClock ?? 0,

                toLogicClock:
                    lastLogicClock,

                durationMs:
                    Date.now() - startedAt,
            };


            await this.observer.onCompleted?.();

            return result;

        } catch (error) {

            await this.observer.onFailed?.(
                error
            );

            throw error;
        }
    }
}