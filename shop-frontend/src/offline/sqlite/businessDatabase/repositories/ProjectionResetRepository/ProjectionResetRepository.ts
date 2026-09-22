import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";

import {
    ProjectionResetRepository,
    ProjectionName,
} from "./ProjectionResetRepositoryContract";

import type {
    SQLiteStatementOperation,
} from "@/src/storage/statement/worker/WorkerProtocol";
import { projectionResetStatements } from "../../statements/projectionRebuilder/projectionRebuilderStatements";
import { ProjectionResetStatementKeys } from "../../statements/projectionRebuilder/projectionRebuilderKeys";


export class SQLiteProjectionResetRepository
    implements ProjectionResetRepository {

    constructor(
        private readonly queryRunner: QueryRunner
    ) {}

    // =========================================================
    // TRANSACTIONAL OPERATIONS
    // =========================================================

    resetOperation(
        name: ProjectionName
    ): SQLiteStatementOperation {

        switch (name) {

            case "businesses":
                return {
                    statementKey:
                        ProjectionResetStatementKeys.businesses,
                    params: [],
                };

            case "branches":
                return {
                    statementKey:
                        ProjectionResetStatementKeys.branches,
                    params: [],
                };

            case "products":
                return {
                    statementKey:
                        ProjectionResetStatementKeys.products,
                    params: [],
                };

            case "inventories":
                return {
                    statementKey:
                        ProjectionResetStatementKeys.inventories,
                    params: [],
                };

            case "sales":
                return {
                    statementKey:
                        ProjectionResetStatementKeys.sales,
                    params: [],
                };
        }
    }


    resetOperations():
        readonly SQLiteStatementOperation[] {

        return [
            this.resetOperation("businesses"),
            this.resetOperation("branches"),
            this.resetOperation("products"),
            this.resetOperation("inventories"),
            this.resetOperation("sales"),
        ];
    }


    // =========================================================
    // STANDALONE WRITES
    // =========================================================

    async reset(
        name: ProjectionName
    ): Promise<void> {

        const operation =
            this.resetOperation(name);

        await this.queryRunner.executePrepared(
            operation.statementKey,
            operation.params ?? []
        );
    }


    async resetAll(): Promise<void> {

        const operations =
            this.resetOperations();

        await this.queryRunner.transaction(
            operations
        );
    }
}