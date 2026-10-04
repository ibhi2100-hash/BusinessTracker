import type{ DatabaseId } from "./worker/DatabaseId"; 
import { SQLiteRuntime } from "../runtime/SQLiteRuntime";

export class WorkerPreparedStatement
{
    private readonly runtime: SQLiteRuntime;
    private readonly database: DatabaseId;
    public readonly key: string;
    constructor(
        runtime: SQLiteRuntime,
        database: DatabaseId,
        key: string
    ) {
        this.runtime = runtime;
        this.database = database;
        this.key = key;
    }

    async execute(
        params: readonly unknown[] = []
    ): Promise<void> {

        await this.runtime.request({
            type: "statement.execute",

            requestId: crypto.randomUUID(),

            database: this.database,

            statementKey: this.key,

            params,
        });
    }

    async query<T>(
        params: readonly unknown[] = []
    ): Promise<T[]> {

        const result =
            await this.runtime.request<T[]>({
                type: "statement.query",

                requestId: crypto.randomUUID(),

                database: this.database,

                statementKey: this.key,

                params,
            });

        return result;
    }

    async scalar<T>(
        params: readonly unknown[] = []
    ): Promise<T | null> {

        const rows =
            await this.query<Record<string, unknown>>(params);

        if (rows.length === 0) {
            return null;
        }

        return Object.values(rows[0])[0] as T;
    }

    async exists(
        params: readonly unknown[] = []
    ): Promise<boolean> {

        const value =
            await this.scalar<number>(params);

        return value === 1;
    }

    dispose(): void {}
}