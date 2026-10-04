import type{
    ProjectionConsumer,
} from "@business/event-bus";

import {
    BusinessEventTypes,
} from "@business/shared-types";
import type { DomainEvent } from "@business/shared-types";
import {
    BranchReducer,
} from "@business/projection-families";

import {
    SQLiteBranchRepository,
} from "../repositories/SQLiteProjectionRepository/SQLiteBranchRepository";

import {
    changeNotifier,
} from "./changeNoifier";

import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol";
import type{ BranchPayload } from "../../../../services/ApplicationService/API/branch/branchRequest"; 

export class BranchConsumer
    implements ProjectionConsumer<DomainEvent> {

    readonly name = "branches";
    private readonly repository: SQLiteBranchRepository
    constructor(
        repository: SQLiteBranchRepository
    ) {
        this.repository = repository
    }


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
                    if(!branch){
                        throw new Error("No Branch we gets")
                    }

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
                    if(!branch){
                        throw new Error("The Branch does exists")
                    }
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