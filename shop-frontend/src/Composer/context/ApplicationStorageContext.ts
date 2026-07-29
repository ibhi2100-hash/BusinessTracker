import { SQLiteRuntime } from "@/src/storage/runtime/SQLiteRuntime";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { ClientRepositoryRegistry } from "@/src/offline/sqlite/clientDatabase/repositories/ClientDatabaseRepositoryRegistry";
import { ClientServieRegistry } from "@/src/offline/sqlite/clientDatabase/services/ClientServiceRegistry";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { ClientStatementRegistry } from "@/src/offline/sqlite/clientDatabase/statements/ClientStatementRegistry";
export interface StorageContext {

    runtime: SQLiteRuntime;

    queryRunner: QueryRunner;

    repositories: ClientRepositoryRegistry;

    services: ClientServieRegistry;

    transactionManager: TransactionManager;

    statementRegistry: ClientStatementRegistry

}