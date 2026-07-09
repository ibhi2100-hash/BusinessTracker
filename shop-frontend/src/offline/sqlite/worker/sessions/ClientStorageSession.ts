import { ClientConnection } from "../../clientDatabase/ClientConnection";
import { ClientMigrationRunner } from "../../clientDatabase/ClientMigrationRunner";
import { PreparedStatementManager } from "../../PreparedStatement/PreparedStatement";
import { QueryExecutor } from "../../queryExecutor/QueryExecutor";
import { TransactionManager } from "../../transactionManager/TransactionManager";
import { AbstractStorageSession } from "./AbstractStorageSession";


export class ClientSession extends AbstractStorageSession {

    private readonly migrations: ClientMigrationRunner;

    constructor() {

        const connection = new ClientConnection();


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

        this.migrations =
            new ClientMigrationRunner(executor);

    }

    async initialize(): Promise<void> {

        if (this.ready) return;

        await this.connection.open();

        this.preparedStatements.clear();

        await this.onInitialize();

        this.ready = true;
        console.log("ClientDatabase Initialized!!")

    }

    protected async onInitialize(): Promise<void> {

        await this.migrations.run();

    }

    protected async onDispose(): Promise<void> {

        await this.connection.close();

    }

}