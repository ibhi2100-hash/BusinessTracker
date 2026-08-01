import { PreparedStatement } from "@/src/offline/sqlite/PreparedStatement/PreparedStatementContract";
import { SQLiteRuntime } from "../runtime/SQLiteRuntime";
import { WorkerPreparedStatement } from "../statement/WorkerPreparedStatement";
import { StatementDefinition } from "@/src/offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";


export class QueryRunner {
    constructor(
        private runtime: SQLiteRuntime,
    ){}

    async execute(sql: string) {

          await this.runtime.connection(
            "exec",
            {
                sql
            }
        );

    }
    async query<T>(sql: string): Promise<T[]> {

        const response =
            await this.runtime.connection(
                "exec",
                {
                    sql,
                    rowMode: "object",
                    returnValue: "resultRows"
                }
            );

        return response.result.resultRows;

    }
    async transaction<T>(
        action: () => Promise<T>
    ) {

        await this.execute("BEGIN IMMEDIATE");

        try {

            const result =
                await action();

            await this.execute("COMMIT");

            return result;

        } catch (e) {

            await this.execute("ROLLBACK");

            throw e;

        }

    }
    prepare(
        def: StatementDefinition
    ): PreparedStatement{
        const stm = new WorkerPreparedStatement(this.runtime, def.key, def.sql);

        return stm
    }
}