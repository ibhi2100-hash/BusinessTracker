import {
    SQLiteEventRepository,
} from "../../repositories/SQLiteEventRepository/eventStore";

import {
    ProjectionEventBus,
} from "@business/event-bus";
import type{ RebuildObserver } from "@business/event-bus";

import type{
    ProjectionResetter,
} from "./ProjectionResetterContract";

import { TransactionManager } from "../../../../../storage/transaction/TransactionManager"; 

import type {
    ProjectionRebuildOptions,
    ProjectionRebuildResult,
} from "./types";

import type {
    DomainEvent,
} from "@business/shared-types";

import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";

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

            if (resetOperations.length > 0) {
                await this.transaction.run(
                    resetOperations
                );
            }

            await this.observer.onResetCompleted?.();


            // =================================================
            // REBUILD FROM EVENT STORE
            // =================================================

            for await (
                const batch
                of this.eventStore.stream(options)
            ) {

                if (batch.length === 0) {
                    continue;
                }

                const operations:
                    SQLiteStatementOperation[] = [];


                // =================================================
                // EVENT OBSERVATION
                // =================================================

                for (const event of batch) {

                    await this.observer.onEventStarted?.(
                        event
                    );
                }


                // =================================================
                // BUILD PROJECTION OPERATIONS
                //
                // Each consumer receives the complete batch.
                //
                // IMPORTANT:
                //
                // buildOperations() returns:
                //
                // SQLiteStatementOperation[]
                //
                // Therefore we FLATTEN with:
                //
                // operations.push(...consumerOperations)
                //
                // and never:
                //
                // operations.push(consumerOperations)
                // =================================================

                for (
                    const consumer
                    of this.projectionBus.getConsumers()
                ) {

                    const consumerStarted =
                        Date.now();


                    // -------------------------------------------------
                    // Build operations for the entire batch
                    // -------------------------------------------------

                    const consumerOperations =
                        consumer.buildOperations(batch);


                    // -------------------------------------------------
                    // Flatten consumer operations into transaction
                    // -------------------------------------------------

                    operations.push(
                        ...consumerOperations
                    );


                    const duration =
                        Date.now() -
                        consumerStarted;


                    // -------------------------------------------------
                    // Consumer observation
                    //
                    // The observer contract is currently event-based,
                    // so report the consumer against each event.
                    // -------------------------------------------------

                    for (const event of batch) {

                        await this.observer.onConsumerStarted?.(
                            consumer,
                            event
                        );

                        await this.observer.onConsumerCompleted?.(
                            consumer,
                            event,
                            duration
                        );
                    }
                }


                // =================================================
                // EVENT PROGRESS
                // =================================================

                for (const event of batch) {

                    eventsProcessed++;

                    lastLogicClock =
                        event.logicClock;

                    await this.observer.onEventCompleted?.(
                        event
                    );
                }


                // =================================================
                // ATOMIC BATCH COMMIT
                // =================================================

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
                    Date.now() -
                    startedAt,
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