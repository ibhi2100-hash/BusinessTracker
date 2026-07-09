import { BusinessConnection } from "../../businessDatabase/engine/ConnectionManager";
import { MigrationManager } from "../../businessDatabase/engine/MigrationManager";
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatement";
import { QueryExecutor } from "../../queryExecutor/QueryExecutor";
import { StorageContext } from "../../clientDatabase/ClientStorageContext";
import { TransactionManager } from "../../transactionManager/TransactionManager";
import { AbstractStorageSession } from "./AbstractStorageSession";

export class BusinessSession extends AbstractStorageSession {

    readonly nodeId: string;

    private readonly migration: MigrationManager;

    constructor(nodeId: string) {

        const connection =
            new BusinessConnection(nodeId);

        

        const statements =
            new PreparedStatementManager(connection);

        const executor =
            new QueryExecutor(connection);

        const transactions =
            new TransactionManager(connection);

        super(

            connection,

            executor,

            transactions,

            statements

        );

        this.nodeId = nodeId;

        this.migration =
            new MigrationManager(
                executor
            );

    }

    async initialize(): Promise<void> {

        if (this.ready) return;

        await this.connection.open();

        this.preparedStatements.clear();

        await this.onInitialize();

        this.ready = true;

    }

    protected async onInitialize(): Promise<void> {

        await this.migration.migrate();

        await this.migration.verify();

    }

    protected async onDispose(): Promise<void> {

        await this.connection.close();

    }

}