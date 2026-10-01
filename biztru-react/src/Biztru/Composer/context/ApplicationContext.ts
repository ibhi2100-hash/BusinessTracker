import { ClientRepositoryRegistry } from "../../offline/sqlite/clientDatabase/repositories/ClientDatabaseRepositoryRegistry" 
import { ClientServiceRegistry } from "../../offline/sqlite/clientDatabase/services/ClientServiceRegistry" 
import { SQLiteRuntime } from "../../storage/runtime/SQLiteRuntime"
import { QueryRunner } from "../../storage/queryRunner/QueryRunner"
import { TransactionManager } from "../../storage/transaction/TransactionManager" 
import { ClientStatementRegistry } from "../../offline/sqlite/clientDatabase/statements/ClientStatementRegistry" 
import { ExecutionContextProvider } from "../../BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext" 
import { ProjectionEventBus } from "@business/event-bus";
import type{ DatabaseId } from "../../storage/statement/worker/DatabaseId" 



export class ApplicationContext
 {
    readonly runtime: SQLiteRuntime;

    readonly queryRunner: QueryRunner;

    readonly transactionManager: TransactionManager;

    readonly repositories: ClientRepositoryRegistry;

    readonly services: ClientServiceRegistry;

    readonly statementRegistry: ClientStatementRegistry;

    readonly ExecutionContext: ExecutionContextProvider;
    
    readonly clientBus: ProjectionEventBus;

    constructor(
        runtime: SQLiteRuntime,

        database: DatabaseId,

        queryRunner: QueryRunner,

        transactionManager: TransactionManager,

        repositorises: ClientRepositoryRegistry,

        services: ClientServiceRegistry,

        statementRegistry: ClientStatementRegistry,

        executionContext: ExecutionContextProvider,

        clientBus: ProjectionEventBus
    ){
        this.runtime = runtime

        this.queryRunner = queryRunner;

        this.transactionManager = transactionManager;

        this.repositories = repositorises

        this.services = services

        this.statementRegistry = statementRegistry

        this.ExecutionContext = executionContext;

        this.clientBus = clientBus
    }

}