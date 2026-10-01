import type { QueryRunner } from "../queryRunner/QueryRunner";
import type { SQLiteStatementOperation } from "../statement/worker/WorkerProtocol";

export class TransactionManager {

    constructor(
        private readonly queryRunner: QueryRunner
    ) {}

    async run(
        operations: readonly SQLiteStatementOperation[]
    ): Promise<void> {

        if (operations.length === 0) {
            return;
        }

        await this.queryRunner.transaction(operations);
    }
}