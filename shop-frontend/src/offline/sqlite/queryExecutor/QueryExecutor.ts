import { IStorageContext } from "../clientDatabase/ClientPreparedStatement";

export class QueryExecutor {

    constructor(
        private readonly context: IStorageContext
    ) {}

   async query<T>(
    sql: string,
    params: unknown[] = []
): Promise<T[]> {

    const db =
        this.context.connectionManager
            

    const rows: T[] = [];

    db.exec({

        sql,

        bind: params,

        rowMode: "object",

        callback(row: T) {

            rows.push(row);

        }

    });

    return rows;
}

    async execute(
    sql: string,
    params: unknown[] = []
) {

    const db =
        this.context
            .connectionManager
            .getDatabase();

    db.exec({

        sql,

        bind: params

    });

}

    async scalar<T>(
    sql: string,
    params: unknown[] = []
): Promise<T | null> {

    const rows =
        await this.query<any>(
            sql,
            params
        );

    if (!rows.length)
        return null;

    return Object.values(
        rows[0]
    )[0] as T;

}
    async exists(
    sql: string,
    params: unknown[] = []
) {

    const value =
        await this.scalar<number>(
            sql,
            params
        );

    return value === 1;

}
}