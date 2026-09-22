import type {
    SQLiteRuntime,
} from "../runtime/SQLiteRuntime";

import type {
    PreparedStatement,
} from "@/src/offline/sqlite/PreparedStatement/PreparedStatementContract";

import {
    WorkerPreparedStatement,
} from "../runtime/SQLiteWorkerClient";

import type {
    StatementDefinition,
} from "@/src/offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";

import type {
    DatabaseId,
} from "../statement/worker/DatabaseId";

import type {
    SQLiteStatementOperation,
    SQLiteMigrationOperation
} from "../statement/worker/WorkerProtocol";


export class QueryRunner {

    constructor(
        private readonly runtime: SQLiteRuntime,
        private readonly database: DatabaseId
    ) {}


    /**
     * RAW SQL
     *
     * Primarily for:
     * - migrations
     * - schema maintenance
     * - infrastructure queries
     */
    async execute(
        sql: string,
        params: readonly unknown[] = []
    ): Promise<void> {

        await this.runtime.rawExec(
            this.database,
            sql,
            params
        );
    }


    /**
     * RAW SELECT
     *
     * Primarily for:
     * - migrations
     * - schema inspection
     * - infrastructure queries
     */
    async query<T = Record<string, unknown>>(
        sql: string,
        params: readonly unknown[] = []
    ): Promise<T[]> {

        return this.runtime.rawQuery<T>(
            this.database,
            sql,
            params
        );
    }


    /**
     * Prepared statement execution.
     */
    async executePrepared(
        statementKey: string,
        params: readonly unknown[] = []
    ): Promise<void> {

        await this.runtime.execute(
            this.database,
            statementKey,
            params
        );
    }


    /**
     * Prepared statement SELECT.
     */
    async queryPrepared<
        T = Record<string, unknown>
    >(
        statementKey: string,
        params: readonly unknown[] = []
    ): Promise<T[]> {

        return this.runtime.query<T>(
            this.database,
            statementKey,
            params
        );
    }


    /**
     * Main-thread remote statement handle.
     *
     * IMPORTANT:
     * This does NOT create a SQLite Stmt here.
     *
     * The actual SQLite prepared statement lives
     * inside the worker and belongs to this database.
     */
    prepare(
        definition: StatementDefinition
    ): PreparedStatement {

        return new WorkerPreparedStatement(
            this.runtime,
            this.database,
            definition.key
        );
    }


    /**
     * Domain transaction.
     *
     * ONE RPC
     * ONE SQLite transaction
     *
     * All operations execute against this QueryRunner's database.
     */
    async transaction(
        operations: readonly SQLiteStatementOperation[]
    ): Promise<void> {

        await this.runtime.transaction(
            this.database,
            operations
        );
    }
    async migrationTransaction(
        statements: readonly SQLiteMigrationOperation[]
    ): Promise<void> {

        await this.runtime.migrationTransaction(
            this.database,
            statements
        );
    }

    /**
     * Database this QueryRunner is bound to.
     */
    getDatabase(): DatabaseId {

        return this.database;
    }
}