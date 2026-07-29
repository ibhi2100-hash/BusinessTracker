import { PreparedStatement } from "./PreparedStatementContract";


export class SQLitePreparedStatement
implements PreparedStatement {

    constructor(
        private readonly stmt: any
    ) {}

    async execute(
        params: readonly unknown[] = []
    ): Promise<void> {

        this.stmt.bind(params);

        this.stmt.step();

        this.stmt.reset();

    }

    async query<T>(
        params: readonly unknown[] = []
    ): Promise<T[]> {

        this.stmt.bind(params);

        const rows: T[] = [];

        while (this.stmt.step()) {

            rows.push(
                this.stmt.getAsObject()
            );

        }

        this.stmt.reset();

        return rows;

    }

    async scalar<T>(
        params: readonly unknown[] = []
    ): Promise<T | null> {

        const rows =
            await this.query<any>(params);

        if (!rows.length)
            return null;

        return Object.values(rows[0])[0] as T;

    }

    async exists(
        params: readonly unknown[] = []
    ): Promise<boolean> {

        return (
            await this.scalar<number>(params)
        ) === 1;

    }

    dispose() {

        this.stmt.free();

    }

}