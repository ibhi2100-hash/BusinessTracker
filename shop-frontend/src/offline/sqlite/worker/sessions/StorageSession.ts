import { DatabaseInfo } from "../../database/databaseInformation";

export interface StorageSession {

    /**
     * Opens and prepares the database.
     */
    initialize(): Promise<void>;

    /**
     * Executes a SELECT query.
     */
    query<T>(
        sql: string,
        params?: readonly unknown[]
    ): Promise<T[]>;

    /**
     * Executes INSERT/UPDATE/DELETE.
     */
    execute(
        sql: string,
        params?: readonly unknown[]
    ): Promise<void>;

    /**
     * Returns a single scalar value.
     */
    scalar<T>(
        sql: string,
        params?: readonly unknown[]
    ): Promise<T | null>;

    /**
     * Returns true if at least one row exists.
     */
    exists(
        sql: string,
        params?: readonly unknown[]
    ): Promise<boolean>;

    /**
     * Executes work inside a transaction.
     */
    transaction<T>(
        callback: () => Promise<T>
    ): Promise<T>;

    beginTransaction(): Promise<void>;

    commitTransaction(): Promise<void>;

    rollbackTransaction(): Promise<void>;

    /**
     * Returns database metadata.
     */
    databaseInfo(): Promise<DatabaseInfo>;

    /**
     * True when the database connection is open.
     */
    isOpen(): boolean;

    /**
     * True after initialization completes.
     */
    isReady(): boolean;

    /**
     * Releases all resources.
     */
    dispose(): Promise<void>;

}