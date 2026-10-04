import type { QueryRunner } from "../queryRunner/QueryRunner";
import type { SQLiteStatementOperation } from "../statement/worker/WorkerProtocol";

export class TransactionManager {
    private readonly queryRunner: QueryRunner
    constructor(
        queryRunner: QueryRunner
    ) {
        this.queryRunner = queryRunner
    }

    async run(
        operations: readonly SQLiteStatementOperation[]
    ): Promise<void> {

        if (operations.length === 0) {
            return;
        }

        await this.queryRunner.transaction(operations);
    }
}