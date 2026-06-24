export interface DatabaseDriver {
    execute(sql: string, params?: unknown[]): Promise<void>;

    query<T>(
        sql: string,
        params?: unknown[]
    ): Promise<T[]>;

    transaction<T>(
        callback: () => Promise<T>
    ): Promise<T>;

    close(): Promise<void>;
}