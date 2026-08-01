import { ClientRepositoryRegistry } from "@/src/offline/sqlite/clientDatabase/repositories/ClientDatabaseRepositoryRegistry";
import { ClientServieRegistry } from "@/src/offline/sqlite/clientDatabase/services/ClientServiceRegistry";
import { StorageContext } from "./ApplicationStorageContext";
import { SQLiteRuntime } from "@/src/storage/runtime/SQLiteRuntime";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { ClientStatementRegistry } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementRegistry";
import { ExecutionContextProvider } from "@/src/BizTru_Karnel/CommandFactory/ExecutionContext/ExecutionContext";




export class ApplicationContext
implements StorageContext {
    readonly runtime: SQLiteRuntime;

    readonly queryRunner: QueryRunner;

    readonly transactionManager: TransactionManager;

    readonly repositories: ClientRepositoryRegistry;

    readonly services: ClientServieRegistry;

    readonly statementRegistry: ClientStatementRegistry;

    readonly ExecutionContext: ExecutionContextProvider;

    constructor(
        runtime: SQLiteRuntime,

        queryRunner: QueryRunner,

        transactionManager: TransactionManager,

        repositorises: ClientRepositoryRegistry,

        services: ClientServieRegistry,

        statementRegistry: ClientStatementRegistry,

        executionContext: ExecutionContextProvider,
    ){
        this.runtime = runtime

        this.queryRunner = queryRunner;

        this.transactionManager = transactionManager;

        this.repositories = repositorises

        this.services = services

        this.statementRegistry = statementRegistry

        this.ExecutionContext = executionContext
    }

}