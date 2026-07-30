import { MigrationManager } from "../../businessDatabase/engine/MigrationManager";

import { QueryExecutor } from "../../queryExecutor/QueryExecutor";
import { TransactionManager } from "../../transactionManager/TransactionManager";
import { AbstractStorageSession } from "./AbstractStorageSession";
import { BusinessConnection } from "../../businessDatabase/engine/BusinessConnection";
import { BusinessPreparedStatementManager } from "../../businessDatabase/statements/PreparedStatementManager";
import { StatementRegistry } from "../../businessDatabase/statements/StatementRegistry";
import { RepositoryRegistry } from "@/src/offline/sqlite/businessDatabase/repositories/RepositoryRegistry";
import { EventStore } from "@/src/BizTru_Karnel/SubKernel/types";
import { EventStored } from "@/src/BizTru_Karnel/EventStore/EventStore";
import { ClientPreparedStatementManager } from "../../clientDatabase/statements/ClientStatementManager";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";

export class BusinessStorageSession extends AbstractStorageSession
{

    readonly nodeId: string;

    private readonly migration: MigrationManager;

    private statementsRegistry: StatementRegistry;
    
    private queryRunner: QueryRunner

    repositories: RepositoryRegistry;

    constructor(
        nodeId: string,
        connection: BusinessConnection

    ) {


        const statements=
            new BusinessPreparedStatementManager()

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
        await this.onInitialize();
        this.statementsRegistry = 
            new StatementRegistry(
                this.statementManager()
            );

        this.repositories =
            new RepositoryRegistry(
                this.statementsRegistry
            )
        
        this.ready = true;

    }

    protected async onInitialize(): Promise<void> {

        await this.migration.migrate();

        await this.migration.verify();

    }

    protected async onDispose(): Promise<void> {
        this.statementManager().clear();
        await this.connection.close();

    }

}