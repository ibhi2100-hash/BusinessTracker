import { IConnectionManager } from "../types/IStorageContext";

export class QueryExecutor {

    constructor(
        private readonly connection: IConnectionManager
    ) {}

    async query<T>(
        sql: string,
        params: unknown[] = []
    ): Promise<T[]> {

        const db = this.connection.getDatabase();
        const rows: T[] = [];

        try {

            db.exec({

                sql,

                bind: params,

                rowMode: "object",

                callback(row: T) {
                    rows.push(row);
                }

            });

            return rows;

        } catch (error) {

            console.group("[SQL QUERY ERROR]");
            console.error("SQL:");
            console.error(sql);
            console.error("Parameters:", params);
            console.error("Error:", error);
            console.groupEnd();

            throw error;
        }
    }

    async execute(
        sql: string,
        params: unknown[] = []
    ) {

        const db = this.connection.getDatabase();
        try {

            db.exec({

                sql,

                bind: params

            });

        } catch (error) {

            console.group("[SQL EXECUTE ERROR]");
            console.error("SQL:");
            console.error(sql);
            console.error("Parameters:", params);
            console.error("Error:", error);
            console.groupEnd();

            throw error;
        }
    }

    async scalar<T>(
        sql: string,
        params: unknown[] = []
    ): Promise<T | null> {

        const rows = await this.query<any>(
            sql,
            params
        );

        if (!rows.length)
            return null;

        return Object.values(rows[0])[0] as T;
    }

    async exists(
        sql: string,
        params: unknown[] = []
    ) {

        const value = await this.scalar<number>(
            sql,
            params
        );

        return value === 1;
    }
}