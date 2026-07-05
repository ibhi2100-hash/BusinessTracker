import { DatabaseInfo } from "../../database/databaseInformation";
import { StorageSession } from "./StorageSession";
import { QueryExecutor } from "../../queryExecutor/QueryExecutor";
import { TransactionManager } from "../../transactionManager/TransactionManager";
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatement";
import { IConnectionManager } from "../../connectionManager/ConnetionContract";

export abstract class AbstractStorageSession
    implements StorageSession {

    protected ready = false;

    protected constructor(

        protected readonly connection: IConnectionManager,

        protected readonly queryExecutor: QueryExecutor,

        protected readonly transactionManager: TransactionManager,

        protected readonly preparedStatements: PreparedStatementManager

    ) {}

    abstract initialize(): Promise<void>;

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

    databaseInfo(): Promise<DatabaseInfo> {

        return this.connection.databaseInfo();

    }

    isOpen(): boolean {

        return this.connection.isOpen();

    }

    isReady(): boolean {

        return this.ready;

    }

    abstract dispose(): Promise<void>;

}