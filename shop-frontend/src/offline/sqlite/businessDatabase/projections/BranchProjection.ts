import {
    ProjectionConsumer,
} from "@business/event-bus";

import {
    BusinessEventTypes,
    DomainEvent,
} from "@business/shared-types";

import {
    BranchReducer,
} from "@business/projection-families";

import {
    SQLiteBranchRepository,
} from "../repositories/SQLiteProjectionRepository/SQLiteBranchRepository";

import {
    changeNotifier,
} from "./changeNoifier";

import type {
    SQLiteStatementOperation,
} from "@/src/storage/statement/worker/WorkerProtocol";
import { BranchPayload } from "@/src/services/ApplicationService/API/branch/branchRequest";


export class BranchConsumer
    implements ProjectionConsumer<DomainEvent> {

    readonly name = "branches";

    constructor(
        private readonly repository: SQLiteBranchRepository
    ) {}


    // =========================================================
    // LIVE EVENT PROCESSING
    // =========================================================

    async handle(
        events: readonly DomainEvent<BranchPayload>[]
    ): Promise<void> {

        for (const event of events) {

            switch (event.type) {

                case BusinessEventTypes.BRANCH_CREATED: {

                    const branch =
                        new BranchReducer().reduce(
                            null,
                            event
                        );

                    await this.repository.upsert(
                        branch
                    );

                    changeNotifier.notify([
                        "branches",
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
        events: readonly DomainEvent<BranchPayload>[]
    ): SQLiteStatementOperation[] {

        const operations:
            SQLiteStatementOperation[] = [];

        for (const event of events) {

            switch (event.type) {

                case BusinessEventTypes.BRANCH_CREATED: {

                    const branch =
                        new BranchReducer().reduce(
                            null,
                            event
                        );

                    operations.push(
                        this.repository.insertOperation(
                            branch
                        )
                    );

                    break;
                }
            }
        }

        return operations;
    }
}