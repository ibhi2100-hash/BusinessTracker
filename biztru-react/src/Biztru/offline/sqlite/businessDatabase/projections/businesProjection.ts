import type{
    ProjectionConsumer,
} from "@business/event-bus";

import {
    BusinessEventTypes,
} from "@business/shared-types";

import type { DomainEvent } from "@business/shared-types";

import type {
    BusinessPayload,
} from "@business/projection-families";
import { BusinessReducer } from "@business/projection-families";

import {
    SQLiteBusinessRepository,
} from "../repositories/SQLiteProjectionRepository/SQLiteBusinessRepository";

import {
    changeNotifier,
} from "./changeNoifier";

import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export class BusinessConsumer
    implements ProjectionConsumer<DomainEvent> {

    readonly name = "businesses";

    constructor(
        private readonly repository: SQLiteBusinessRepository
    ) {}


    // =========================================================
    // LIVE EVENT PROCESSING
    // =========================================================

    async handle(
        events: readonly DomainEvent<BusinessPayload>[]
    ): Promise<void> {

        for (const event of events) {

            switch (event.type) {

                case BusinessEventTypes.BUSINESS_CREATED: {

                    const business =
                        new BusinessReducer().reduce(
                            null,
                            event
                        );

                    await this.repository.upsert(
                        business
                    );

                    changeNotifier.notify([
                        "businesses",
                    ]);

                    break;
                }


                case BusinessEventTypes.BUSINESS_ACTIVATION: {

                    const businessState =
                        await this.repository.findById(
                            event.businessId
                        );

                    const businessActivation =
                        new BusinessReducer().reduce(
                            businessState,
                            event
                        );

                    await this.repository.activateBusiness(
                        businessActivation
                    );

                    changeNotifier.notify([
                        "businesses",
                    ]);

                    break;
                }
            }
        }
    }


    // =========================================================
    // PROJECTION REBUILD
    // =========================================================

    buildOperations(
        events: readonly DomainEvent<BusinessPayload>[]
    ): SQLiteStatementOperation[] {

        const operations:
            SQLiteStatementOperation[] = [];

        /*
         * IMPORTANT:
         *
         * Do NOT do:
         *
         * await repository.findById(...)
         *
         * here.
         *
         * The rebuild database is being reconstructed.
         * The projection must be derived from the event stream.
         */

        let businessState: ReturnType<
            BusinessReducer["reduce"]
        > | null = null;


        for (const event of events) {

            switch (event.type) {

                case BusinessEventTypes.BUSINESS_CREATED: {

                    businessState =
                        new BusinessReducer().reduce(
                            null,
                            event
                        );

                    operations.push(
                        this.repository.upsertOperation(
                            businessState
                        )
                    );

                    break;
                }


                case BusinessEventTypes.BUSINESS_ACTIVATION: {

                    businessState =
                        new BusinessReducer().reduce(
                            businessState,
                            event
                        );

                    operations.push(
                        this.repository.activateBusinessOperation(
                            businessState
                        )
                    );

                    break;
                }
            }
        }

        return operations;
    }
}