import type {
    StatementDefinition,
} from "@/src/offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";

import type {
    DatabaseId,
} from "./DatabaseId";

/**
 * ============================================================
 * TRANSACTION OPERATION
 * ============================================================
 *
 * Operations executed against ONE database inside a transaction.
 */
export interface SQLiteStatementOperation {

    statementKey: string;

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
    | SQLiteWorkerHealthRequest;


/**
 * ============================================================
 * INITIALIZE SQLITE ENGINE
 * ============================================================
 *
 * IMPORTANT:
 *
 * This request initializes SQLite WASM and installs the
 * selected VFS.
 *
 * It does NOT open a database.
 *
 * One SQLiteRuntime -> one initialize request.
 */
export interface SQLiteWorkerInitializeRequest {

    type: "initialize";

    requestId: string;

    /**
     * SQLite VFS to use.
     *
     * Example:
     * "opfs-sahpool"
     */
    vfs?: string;

    /**
     * Optional OPFS SAH-pool directory.
     */
    opfsDirectory?: string;

    /**
     * Enables worker-side debugging/logging.
     */
    debug?: boolean;
}


/**
 * ============================================================
 * OPEN DATABASE
 * ============================================================
 *
 * Opens one logical database inside the shared SQLite worker.
 *
 * The same worker may receive many of these:
 *
 * database.open(client)
 * database.open(business:A)
 * database.open(business:B)
 */
export interface SQLiteWorkerOpenDatabaseRequest {

    type: "database.open";

    requestId: string;

    database: DatabaseId;

    /**
     * SQLite database filename.
     *
     * For SAH-pool this should be an absolute virtual
     * database path, e.g.
     *
     * /client.db
     * /business/abc.db
     */
    filename: string;

    /**
     * Optional per-database VFS override.
     *
     * Usually omitted when the runtime already has
     * a global VFS configuration.
     */
    vfs?: string;

    /**
     * Optional OPFS directory.
     */
    opfsDirectory?: string;

    debug?: boolean;
}


/**
 * ============================================================
 * CLOSE DATABASE
 * ============================================================
 *
 * Closes ONE database.
 *
 * This does NOT terminate SQLite WASM or the worker.
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
 *
 * Executes arbitrary SQL against ONE database.
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
 *
 * Executes arbitrary SQL and returns rows from ONE database.
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
 *
 * Registers statements inside the statement registry belonging
 * to ONE database.
 */
export interface SQLiteWorkerRegisterStatementsRequest {

    type: "statements.initialize";

    requestId: string;

    database: DatabaseId;

    definitions: StatementDefinition[];
}


/**
 * ============================================================
 * TRANSACTION
 * ============================================================
 *
 * A transaction always belongs to exactly ONE database.
 *
 * The individual operations therefore do NOT need their own
 * DatabaseId.
 */
export interface SQLiteWorkerTransactionRequest {

    type: "transaction";

    requestId: string;

    database: DatabaseId;

    operations: SQLiteStatementOperation[];
}


/**
 * ============================================================
 * HEALTH CHECK
 * ============================================================
 *
 * Checks the state of ONE opened database.
 */
export interface SQLiteWorkerHealthRequest {

    type: "health";

    requestId: string;

    database: DatabaseId;
}


/**
 * ============================================================
 * SUCCESS RESPONSE
 * ============================================================
 */

export interface SQLiteWorkerSuccess {

    requestId: string;

    ok: true;

    result?: unknown;
}


/**
 * ============================================================
 * FAILURE RESPONSE
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
 * WORKER RESPONSE UNION
 * ============================================================
 */

export type SQLiteWorkerResponse =
    | SQLiteWorkerSuccess
    | SQLiteWorkerFailure;