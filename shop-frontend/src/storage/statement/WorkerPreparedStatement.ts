// WorkerPreparedStatement.ts

import { PreparedStatement } from "@/src/offline/sqlite/PreparedStatement/PreparedStatementContract";
import { SQLiteRuntime } from "../runtime/SQLiteRuntime";

export class WorkerPreparedStatement
implements PreparedStatement {

    constructor(
        private readonly runtime: SQLiteRuntime,
        readonly key: string,
        readonly sql: string
    ) {}

    async execute(
        params: readonly unknown[] = []
    ): Promise<void> {

        await this.runtime.connection(
            "exec",
            {
                dbId: (this.runtime as any).dbId,
                sql: this.sql,
                bind: params
            }
        );

    }

    async query<T>(
        params: readonly unknown[] = []
    ): Promise<T[]> {

        const response =
            await this.runtime.connection(
                "exec",
                {   dbId: (this.runtime as any).dbId,
                    sql: this.sql,
                    bind: params,
                    rowMode: "object",
                    returnValue: "resultRows"
                }
            );
        return response.result?.resultRows ?? [];

    }

    async scalar<T>(
        params: readonly unknown[] = []
    ): Promise<T | null> {

        const rows =
            await this.query<T>(params);

        if(rows.length===0)
            return null;

        const row = rows[0];
        const rowValues = Object.values(row as any);

        return rowValues[0] as T;

    }

    async exists(
        params: readonly unknown[] = []
    ): Promise<boolean>{

        const rows =
            await this.query(params);

        return rows.length>0;

    }

    dispose(): void{

        // Worker1 has nothing to dispose.

    }

}