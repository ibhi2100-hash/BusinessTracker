import { DatabaseInfo } from "../../database/databaseInformation";
import { ClientConnection } from "../../clientDatabase/ClientConnection";
import { ClientMigrationRunner } from "../../clientDatabase/ClientMigrationRunner";
import { StorageContext } from "../../clientDatabase/ClientStorageContext"
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatement";
import { QueryExecutor } from "../../queryExecutor/QueryExecutor";
import { TransactionManager } from "../../transactionManager/TransactionManager";

export class ClientSession {

    private readonly connection: ClientConnection;

    private readonly context: StorageContext;

    private readonly queryExecutor: QueryExecutor;

    private readonly transactionManager: TransactionManager;

    private readonly preparedStatements: PreparedStatementManager;

    private readonly migrations: ClientMigrationRunner;

    private ready = false;

    constructor() {

        this.connection =
            new ClientConnection();

        this.context =
            new StorageContext(
                this.connection
            );

        this.preparedStatements =
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

        this.migrations =
            new ClientMigrationRunner(
                this.connection
            );

    }

    async initialize(): Promise<void> {

        if (this.ready) {
            return;
        }

        await this.connection.open();

        this.preparedStatements.clear();

        await this.migrations.run();

        this.ready = true;

    }

    query<T>(
        sql: string,
        params: unknown[] = []
    ) {

        return this.queryExecutor.query<T>(
            sql,
            params
        );

    }

    execute(
        sql: string,
        params: unknown[] = []
    ) {

        return this.queryExecutor.execute(
            sql,
            params
        );

    }

    scalar<T>(
        sql: string,
        params: unknown[] = []
    ) {

        return this.queryExecutor.scalar<T>(
            sql,
            params
        );

    }

    exists(
        sql: string,
        params: unknown[] = []
    ) {

        return this.queryExecutor.exists(
            sql,
            params
        );

    }

    transaction<T>(
        callback: () => Promise<T>
    ) {

        return this.transactionManager.transaction(
            callback
        );

    }

    async beginTransaction() {

        await this.transactionManager.begin();

    }

    async commitTransaction() {

        await this.transactionManager.commit();

    }

    async rollbackTransaction() {

        await this.transactionManager.rollback();

    }

    async databaseInfo(): Promise<DatabaseInfo> {

        return this.connection.databaseInfo();

    }

    isOpen(): boolean {

        return this.connection.isOpen();

    }

    isReady(): boolean {

        return this.ready;

    }

    async dispose(): Promise<void> {

        try {

            if (this.transactionManager.inTransaction) {

                await this.transactionManager.rollback();

            }

        } catch {
            // Ignore rollback errors during shutdown.
        }

        this.preparedStatements.clear();

        await this.connection.close();

        this.ready = false;

    }

}