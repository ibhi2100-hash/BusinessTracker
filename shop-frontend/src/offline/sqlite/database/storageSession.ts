export interface StorageSession {

    query<T>(
        sql: string,
        params?: unknown[]
    ): Promise<T[]>;

    execute(
        sql: string,
        params?: unknown[]
    ): Promise<void>;

    scalar<T>(
        sql: string,
        params?: unknown[]
    ): Promise<T | null>;

    exists(
        sql: string,
        params?: unknown[]
    ): Promise<boolean>;

}