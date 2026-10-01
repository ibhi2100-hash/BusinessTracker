import type { PreparedStatement } from "../../offline/sqlite/PreparedStatement/PreparedStatementContract";
import type {
    SQLiteRuntime,
} from "../runtime/SQLiteRuntime";

import type{ DatabaseId } from "../statement/worker/DatabaseId"; 


export class WorkerPreparedStatement
    implements PreparedStatement {

    private disposed = false;

    constructor(
        private readonly runtime: SQLiteRuntime,
        private readonly database: DatabaseId,
        public readonly key: string
    ) {}

    async execute(
        params: readonly unknown[] = []
    ): Promise<void> {

        this.assertUsable();

        await this.runtime.execute(
            this.database,
            this.key,
            params
        );
    }

    async query<T>(
        params: readonly unknown[] = []
    ): Promise<T[]> {

        this.assertUsable();

        return this.runtime.query<T>(
            this.database,
            this.key,
            params
        );
    }

    async scalar<T>(
        params: readonly unknown[] = []
    ): Promise<T | null> {

        this.assertUsable();

        const rows =
            await this.query<T>(params);

        return rows.length > 0
            ? rows[0]
            : null;
    }

    async exists(
        params: readonly unknown[] = []
    ): Promise<boolean> {

        this.assertUsable();

        const rows =
            await this.query<unknown>(
                params
            );

        return rows.length > 0;
    }

    dispose(): void {

        this.disposed = true;
    }

    private assertUsable(): void {

        if (this.disposed) {

            throw new Error(
                `Prepared statement "${this.key}" has been disposed.`
            );
        }
    }
}