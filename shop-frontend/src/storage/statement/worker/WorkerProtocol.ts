import type {
    StatementDefinition,
} from "@/src/offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";

import type {
    DatabaseId,
} from "./DatabaseId";

/**
 * ============================================================
 * NORMAL TRANSACTION OPERATION
 * ============================================================
 *
 * Used by application/domain transactions.
 *
 * Every operation references a registered prepared statement.
 */
export interface SQLiteStatementOperation {

    statementKey: string;

    params?: readonly unknown[];
}


/**
 * ============================================================
 * MIGRATION SQL OPERATION
 * ============================================================
 *
 * Used ONLY by the migration system.
 *
 * Migrations need arbitrary SQL because they perform things like:
 *
 * - CREATE TABLE
 * - ALTER TABLE
 * - CREATE INDEX
 * - CREATE TRIGGER
 * - INSERT seed data
 * - etc.
 */
export interface SQLiteMigrationOperation {

    sql: string;

    params?: readonly unknown[];
}


/**
 * ============================================================
 * WORKER REQUEST UNION
 * ============================================================
 */

export type SQLiteWorkerRequest =
    | SQLiteWorkerInitializeRequest
    | SQLiteWorkerOpenDatabaseRequest
    | SQLiteWorkerCloseDatabaseRequest
    | SQLiteWorkerExecRequest
    | SQLiteWorkerQueryRequest
    | SQLiteWorkerStatementExecuteRequest
    | SQLiteWorkerStatementQueryRequest
    | SQLiteWorkerRegisterStatementsRequest
    | SQLiteWorkerTransactionRequest
    | SQLiteWorkerMigrationRequest
    | SQLiteWorkerHealthRequest;


/**
 * ============================================================
 * INITIALIZE SQLITE ENGINE
 * ============================================================
 */

export interface SQLiteWorkerInitializeRequest {

    type: "initialize";

    requestId: string;

    vfs?: string;

    opfsDirectory?: string;

    debug?: boolean;
}


/**
 * ============================================================
 * OPEN DATABASE
 * ============================================================
 */

export interface SQLiteWorkerOpenDatabaseRequest {

    type: "database.open";

    requestId: string;

    database: DatabaseId;

    filename: string;

    vfs?: string;

    opfsDirectory?: string;

    debug?: boolean;
}


/**
 * ============================================================
 * CLOSE DATABASE
 * ============================================================
 */

export interface SQLiteWorkerCloseDatabaseRequest {

    type: "database.close";

    requestId: string;

    database: DatabaseId;
}


/**
 * ============================================================
 * RAW EXEC
 * ============================================================
 */

export interface SQLiteWorkerExecRequest {

    type: "exec";

    requestId: string;

    database: DatabaseId;

    sql: string;

    params?: readonly unknown[];
}


/**
 * ============================================================
 * RAW QUERY
 * ============================================================
 */

export interface SQLiteWorkerQueryRequest {

    type: "query";

    requestId: string;

    database: DatabaseId;

    sql: string;

    params?: readonly unknown[];
}


/**
 * ============================================================
 * PREPARED STATEMENT EXECUTE
 * ============================================================
 */

export interface SQLiteWorkerStatementExecuteRequest {

    type: "statement.execute";

    requestId: string;

    database: DatabaseId;

    statementKey: string;

    params?: readonly unknown[];
}


/**
 * ============================================================
 * PREPARED STATEMENT QUERY
 * ============================================================
 */

export interface SQLiteWorkerStatementQueryRequest {

    type: "statement.query";

    requestId: string;

    database: DatabaseId;

    statementKey: string;

    params?: readonly unknown[];
}


/**
 * ============================================================
 * REGISTER PREPARED STATEMENTS
 * ============================================================
 */

export interface SQLiteWorkerRegisterStatementsRequest {

    type: "statements.initialize";

    requestId: string;

    database: DatabaseId;

    definitions: StatementDefinition[];
}


/**
 * ============================================================
 * NORMAL APPLICATION TRANSACTION
 * ============================================================
 *
 * One database.
 *
 * The worker owns:
 *
 * BEGIN
 * operations
 * COMMIT / ROLLBACK
 */
export interface SQLiteWorkerTransactionRequest {

    type: "transaction";

    requestId: string;

    database: DatabaseId;

    operations: readonly SQLiteStatementOperation[];
}


/**
 * ============================================================
 * MIGRATION TRANSACTION
 * ============================================================
 *
 * One database.
 *
 * The worker owns:
 *
 * BEGIN
 * migration SQL
 * schema version SQL
 * COMMIT / ROLLBACK
 */
export interface SQLiteWorkerMigrationRequest {

    type: "migration.transaction";

    requestId: string;

    database: DatabaseId;

    statements: readonly SQLiteMigrationOperation[];
}


/**
 * ============================================================
 * HEALTH CHECK
 * ============================================================
 */

export interface SQLiteWorkerHealthRequest {

    type: "health";

    requestId: string;

    database: DatabaseId;
}


/**
 * ============================================================
 * SUCCESS
 * ============================================================
 */

export interface SQLiteWorkerSuccess {

    requestId: string;

    ok: true;

    result?: unknown;
}


/**
 * ============================================================
 * FAILURE
 * ============================================================
 */

export interface SQLiteWorkerFailure {

    requestId: string;

    ok: false;

    error: {

        name: string;

        message: string;

        stack?: string;
    };
}


/**
 * ============================================================
 * WORKER RESPONSE
 * ============================================================
 */

export type SQLiteWorkerResponse =
    | SQLiteWorkerSuccess
    | SQLiteWorkerFailure;