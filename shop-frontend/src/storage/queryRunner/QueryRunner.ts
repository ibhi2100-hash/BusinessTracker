import { PreparedStatement } from "@/src/offline/sqlite/PreparedStatement/PreparedStatementContract";
import { SQLiteRuntime } from "../runtime/SQLiteRuntime";
import { WorkerPreparedStatement } from "../statement/WorkerPreparedStatement";
import { StatementDefinition } from "@/src/offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";

export class QueryRunner {

    constructor(
        private readonly runtime:
            SQLiteRuntime,
    ) {}


    async execute(
        sql: string,
        params: readonly unknown[] = []
    ): Promise<void> {

        await this.runtime.connection(
            "exec",
            {
                dbId:
                    this.runtime.databaseId,

                sql,

                bind:
                    params,
            }
        );
    }


    async query<T>(
        sql: string,
        params: readonly unknown[] = []
    ): Promise<T[]> {

        const response =
            await this.runtime.connection(
                "exec",
                {
                    dbId:
                        this.runtime.databaseId,

                    sql,

                    bind:
                        params,

                    rowMode:
                        "object",

                    returnValue:
                        "resultRows",
                }
            );

        return (
            response.result?.resultRows ??
            []
        );
    }


    async transaction<T>(
        action: () => Promise<T>
    ): Promise<T> {

        await this.execute(
            "BEGIN IMMEDIATE"
        );

        try {

            const result =
                await action();

            await this.execute(
                "COMMIT"
            );

            return result;

        } catch (error) {

            await this.execute(
                "ROLLBACK"
            );

            throw error;
        }
    }


    prepare(
        def: StatementDefinition
    ): PreparedStatement {

        return new WorkerPreparedStatement(
            this.runtime,
            def.key,
            def.sql
        );
    }
}