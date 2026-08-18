import { ClientRepositoryRegistry } from "@/src/offline/sqlite/clientDatabase/repositories/ClientDatabaseRepositoryRegistry";
import { ClientServiceRegistry } from "@/src/offline/sqlite/clientDatabase/services/ClientServiceRegistry";
import { SQLiteRuntime } from "@/src/storage/runtime/SQLiteRuntime";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { ClientStatementRegistry } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementRegistry";
import { ExecutionContextProvider } from "@/src/BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";
import { ProjectionEventBus } from "@/src/buses/ProjectionBuses";




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