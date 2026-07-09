import { DatabaseInfo } from "../../database/databaseInformation";
import { IConnectionManager } from "../../types/IStorageContext";
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatement";
import { QueryExecutor } from "../../queryExecutor/QueryExecutor";
import { TransactionManager } from "../../transactionManager/TransactionManager";

export abstract class AbstractStorageSession {

    protected ready = false;

    protected constructor(

        protected readonly connection: IConnectionManager,

        protected readonly queryExecutor: QueryExecutor,

        protected readonly transactionManager: TransactionManager,

        protected readonly preparedStatements: PreparedStatementManager

    ) {}

    abstract initialize(): Promise<void>;

    protected abstract onInitialize(): Promise<void>;

    protected abstract onDispose(): Promise<void>;

    async query<T>(
        sql: string,
        params: readonly unknown[] = []
    ): Promise<T[]> {

        return this.queryExecutor.query<T>(
            sql,
            [...params]
        );

    }

    async execute(
        sql: string,
        params: readonly unknown[] = []
    ): Promise<void> {

        await this.queryExecutor.execute(
            sql,
            [...params]
        );

    }

    async scalar<T>(
        sql: string,
        params: readonly unknown[] = []
    ): Promise<T | null> {

        return this.queryExecutor.scalar<T>(
            sql,
            [...params]
        );

    }

    async exists(
        sql: string,
        params: readonly unknown[] = []
    ): Promise<boolean> {

        return this.queryExecutor.exists(
            sql,
            [...params]
        );

    }

    transaction<T>(
        callback: () => Promise<T>
    ) {

        return this.transactionManager.transaction(callback);

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

        } catch {}

        this.preparedStatements.clear();

        await this.onDispose();

        this.ready = false;

    }

}