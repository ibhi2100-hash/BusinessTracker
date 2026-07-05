import { DatabaseInfo } from "../../database/databaseInformation";
import { BusinessConnection } from "../../businessDatabase/engine/ConnectionManager";
import { MigrationManager } from "../../businessDatabase/engine/MigrationManager";
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatement";
import { QueryExecutor } from "../../queryExecutor/QueryExecutor";
import { StorageContext } from "../../clientDatabase/ClientStorageContext";
import { TransactionManager } from "../../transactionManager/TransactionManager";

export class BusinessSession {

    public readonly nodeId: string;

    private readonly context: StorageContext;

    private readonly connection: BusinessConnection;

    private readonly queryExecutor: QueryExecutor;

    private readonly transactionManager: TransactionManager;

    private readonly migrationManager: MigrationManager;

    private readonly preparedStatementManager: PreparedStatementManager;

    private ready = false;

    constructor(nodeId: string) {

        this.nodeId = nodeId;

        this.connection =
            new BusinessConnection(this.nodeId);

        this.context =
            new StorageContext(
                this.connection
            );

        this.preparedStatementManager =
            new PreparedStatementManager(
                this.context
            );

        this.queryExecutor =
            new QueryExecutor(
                this.context
            );

        this.transactionManager =
            new TransactionManager(
                this.context
            );

        this.migrationManager =
            new MigrationManager(
                this.context,
                this.queryExecutor
            );

    }

    /**
     * Opens the database and prepares it for use.
     */
    async initialize(): Promise<void> {

        if (this.ready) {
            return;
        }

        await this.connection.open();

        this.preparedStatementManager.clear();

        await this.migrationManager.migrate();

        await this.migrationManager.verify();

        this.ready = true;

    }

    /**
     * Executes a SELECT query.
     */
    query<T>(
        sql: string,
        params: unknown[] = []
    ): Promise<T[]> {

        return this.queryExecutor.query<T>(
            sql,
            params
        );

    }

    /**
     * Executes INSERT/UPDATE/DELETE.
     */
    execute(
        sql: string,
        params: unknown[] = []
    ): Promise<void> {

        return this.queryExecutor.execute(
            sql,
            params
        );

    }

    /**
     * Returns a single scalar value.
     */
    scalar<T>(
        sql: string,
        params: unknown[] = []
    ): Promise<T | null> {

        return this.queryExecutor.scalar<T>(
            sql,
            params
        );

    }

    /**
     * Returns whether a row exists.
     */
    exists(
        sql: string,
        params: unknown[] = []
    ): Promise<boolean> {

        return this.queryExecutor.exists(
            sql,
            params
        );

    }

    /**
     * Runs a transactional callback.
     */
    transaction<T>(
        callback: () => Promise<T>
    ): Promise<T> {

        return this.transactionManager.transaction(
            callback
        );

    }

    async beginTransaction(): Promise<void> {

        await this.transactionManager.begin();

    }

    async commitTransaction(): Promise<void> {

        await this.transactionManager.commit();

    }

    async rollbackTransaction(): Promise<void> {

        await this.transactionManager.rollback();

    }

    /**
     * Runs VACUUM.
     */
    async vacuum(): Promise<void> {

        await this.queryExecutor.execute(
            "VACUUM"
        );

    }

    /**
     * Verifies database integrity.
     */
    async integrityCheck(): Promise<void> {

        await this.migrationManager.verify();

    }

    /**
     * Returns database metadata.
     *
     * Delegate to ConnectionManager once implemented.
     */
    async databaseInfo(): Promise<DatabaseInfo> {

        return this.connection.databaseInfo();

    }

    /**
     * Indicates whether this session is ready.
     */
    isReady(): boolean {

        return this.ready;

    }

    /**
     * Indicates whether the database connection is open.
     */
    isOpen(): boolean {

        return this.connection.isOpen();

    }

    /**
     * Closes the session and releases resources.
     */
    async dispose(): Promise<void> {

        try {

            if (this.transactionManager.inTransaction) {

                await this.transactionManager.rollback();

            }

        } catch {

            // ignore rollback failures during dispose

        }

        this.preparedStatementManager.clear();

        await this.connection.close();

        this.ready = false;

    }

}