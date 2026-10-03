import {
    WorkerDatabaseRegistry,
} from "./WorkerDatabaseRegistry";

import type {
    SQLiteWorkerRequest,
    SQLiteWorkerResponse,
    SQLiteStatementOperation,
} from "./WorkerProtocol";


/**
 * ================================================================
 * WORKER STATE
 * ================================================================
 */

const databases =
    new WorkerDatabaseRegistry();

/**
 * SQLite engine initialization is asynchronous, but it should
 * only ever happen once.
 *
 * Multiple requests arriving during initialization all await the
 * same Promise instead of creating a request queue.
 */
let sqliteInitialization:
    Promise<void> | null = null;


/**
 * ================================================================
 * RESPONSE HELPERS
 * ================================================================
 */

function success(
    requestId: string,
    result?: unknown
): SQLiteWorkerResponse {

    return {
        requestId,
        ok: true,
        result,
    };
}


function failure(
    requestId: string,
    error: unknown
): SQLiteWorkerResponse {

    const normalized =
        error instanceof Error
            ? error
            : new Error(String(error));

    return {
        requestId,
        ok: false,
        error: {
            name: normalized.name,
            message: normalized.message,
            stack: normalized.stack,
        },
    };
}


/**
 * ================================================================
 * SQLITE INITIALIZATION
 * ================================================================
 */

function initializeSQLite(): Promise<void> {

    if (sqliteInitialization) {
        return sqliteInitialization;
    }

    sqliteInitialization =
        databases.initializeSQLite()
            .catch(error => {

                /**
                 * Allow a future initialization attempt if
                 * initialization failed.
                 */
                sqliteInitialization = null;

                throw error;
            });

    return sqliteInitialization;
}


/**
 * ================================================================
 * STATEMENT HELPERS
 * ================================================================
 */

function bindStatement(
    statement: any,
    params: readonly unknown[] = []
): void {

    statement.reset(true);

    if (params.length > 0) {
        statement.bind(params);
    }
}


function executeStatement(
    statement: any,
    params: readonly unknown[] = []
): void {

    bindStatement(
        statement,
        params
    );

    try {

        statement.step();

    } finally {

        statement.reset(true);
    }
}


function queryStatement<T>(
    statement: any,
    params: readonly unknown[] = []
): T[] {

    bindStatement(
        statement,
        params
    );

    const rows: T[] = [];

    try {

        const columnNames: string[] =
            statement.getColumnNames();

        while (statement.step()) {

            const values: unknown[] =
                statement.get([]);

            const row: Record<string, unknown> = {};

            for (
                let i = 0;
                i < columnNames.length;
                i++
            ) {

                row[columnNames[i]] =
                    values[i];
            }

            rows.push(row as T);
        }

        return rows;

    } finally {

        statement.reset(true);
    }
}


/**
 * ================================================================
 * TRANSACTION
 * ================================================================
 */

function runTransaction(
    db: any,
    statements: any,
    operations: readonly SQLiteStatementOperation[]
): void {

    if (operations.length === 0) {
        return;
    }

    db.exec("BEGIN IMMEDIATE");

    try {

        for (
            const [index, operation]
            of operations.entries()
        ) {

            if (!operation) {

                throw new Error(
                    `Invalid SQLite transaction operation at index ${index}: ` +
                    `operation is null or undefined`
                );
            }

            if (
                typeof operation.statementKey !== "string" ||
                operation.statementKey.trim() === ""
            ) {

                throw new Error(
                    `Invalid SQLite transaction operation at index ${index}: ` +
                    `statementKey=${String(operation.statementKey)}`
                );
            }

            if (
                !statements.has(
                    operation.statementKey
                )
            ) {

                throw new Error(
                    `SQLite transaction statement not registered: ` +
                    `${operation.statementKey} ` +
                    `(operation index ${index})`
                );
            }

            const statement =
                statements.get(
                    operation.statementKey
                );

            executeStatement(
                statement,
                operation.params ?? []
            );
        }

        db.exec("COMMIT");

    } catch (error) {

        try {
            db.exec("ROLLBACK");
        } catch {
            // Preserve original error.
        }

        throw error;
    }
}


/**
 * ================================================================
 * MIGRATION TRANSACTION
 * ================================================================
 */

function runMigrationTransaction(
    db: any,
    statements: readonly {
        sql: string;
        params?: readonly unknown[];
    }[]
): void {

    if (statements.length === 0) {
        return;
    }

    db.exec("BEGIN IMMEDIATE");

    try {

        for (const statement of statements) {

            db.exec({
                sql: statement.sql,
                bind: statement.params ?? [],
            });
        }

        db.exec("COMMIT");

    } catch (error) {

        try {
            db.exec("ROLLBACK");
        } catch {
            // Preserve original migration error.
        }

        throw error;
    }
}


/**
 * ================================================================
 * REQUEST HANDLER
 * ================================================================
 *
 * IMPORTANT:
 *
 * There is deliberately NO Promise queue here.
 *
 * Synchronous SQLite operations execute immediately on the worker
 * thread. The browser's worker event loop already guarantees that
 * JavaScript execution is not concurrently executing two handlers.
 */

async function handleRequest(
    request: SQLiteWorkerRequest
): Promise<SQLiteWorkerResponse> {

    try {

        switch (request.type) {

            /**
             * ----------------------------------------------------
             * SQLITE INITIALIZATION
             * ----------------------------------------------------
             */

            case "initialize": {

                await initializeSQLite();

                return success(
                    request.requestId
                );
            }


            /**
             * ----------------------------------------------------
             * DATABASE OPEN
             * ----------------------------------------------------
             */

            case "database.open": {

                /**
                 * Opening a database depends on the SQLite engine,
                 * so guarantee initialization first.
                 *
                 * This does NOT create a request queue.
                 */
                await initializeSQLite();

                const context =
                    await databases.open(
                        request.database,
                        request.filename,
                        request.vfs,
                        request.debug
                    );

                return success(
                    request.requestId,
                    {
                        database: context.key,
                        filename: context.filename,
                    }
                );
            }


            /**
             * ----------------------------------------------------
             * DATABASE CLOSE
             * ----------------------------------------------------
             */

            case "database.close": {

                databases.close(
                    request.database
                );

                return success(
                    request.requestId
                );
            }


            /**
             * ----------------------------------------------------
             * RAW EXEC
             * ----------------------------------------------------
             */

            case "exec": {

                const context =
                    databases.get(
                        request.database
                    );

                context.db.exec({
                    sql: request.sql,
                    bind: request.params,
                });

                return success(
                    request.requestId
                );
            }


            /**
             * ----------------------------------------------------
             * RAW QUERY
             * ----------------------------------------------------
             */

            case "query": {

                const context =
                    databases.get(
                        request.database
                    );

                const rows =
                    context.db.exec({
                        sql: request.sql,
                        bind: request.params,
                        rowMode: "object",
                        returnValue: "resultRows",
                    });

                return success(
                    request.requestId,
                    rows
                );
            }


            /**
             * ----------------------------------------------------
             * INITIALIZE PREPARED STATEMENTS
             * ----------------------------------------------------
             */

            case "statements.initialize": {

                const context =
                    databases.get(
                        request.database
                    );

                context.statements.initialize(
                    request.definitions
                );

                return success(
                    request.requestId,
                    {
                        statementCount:
                            context.statements.size,
                    }
                );
            }


            /**
             * ----------------------------------------------------
             * PREPARED STATEMENT EXECUTE
             * ----------------------------------------------------
             */

            case "statement.execute": {

                const context =
                    databases.get(
                        request.database
                    );

                const statement =
                    context.statements.get(
                        request.statementKey
                    );

                executeStatement(
                    statement,
                    request.params
                );

                return success(
                    request.requestId
                );
            }


            /**
             * ----------------------------------------------------
             * PREPARED STATEMENT QUERY
             * ----------------------------------------------------
             */

            case "statement.query": {

                const context =
                    databases.get(
                        request.database
                    );

                const statement =
                    context.statements.get(
                        request.statementKey
                    );

                const rows =
                    queryStatement(
                        statement,
                        request.params
                    );

                return success(
                    request.requestId,
                    rows
                );
            }


            /**
             * ----------------------------------------------------
             * TRANSACTION
             * ----------------------------------------------------
             */

            case "transaction": {

                const context =
                    databases.get(
                        request.database
                    );

                const result =
                    runTransaction(
                        context.db,
                        context.statements,
                        request.operations
                    );

                return success(
                    request.requestId,
                    result
                );
            }


            /**
             * ----------------------------------------------------
             * HEALTH
             * ----------------------------------------------------
             */

            case "health": {

                const context =
                    databases.get(
                        request.database
                    );

                const result =
                    context.db.exec({
                        sql: "SELECT 1 AS ok",
                        rowMode: "object",
                        returnValue: "resultRows",
                    });

                return success(
                    request.requestId,
                    {
                        healthy: true,
                        database: context.key,
                        filename: context.filename,
                        statementCount:
                            context.statements.size,
                        result,
                    }
                );
            }


            /**
             * ----------------------------------------------------
             * MIGRATION TRANSACTION
             * ----------------------------------------------------
             */

            case "migration.transaction": {

                const context =
                    databases.get(
                        request.database
                    );

                runMigrationTransaction(
                    context.db,
                    request.statements
                );

                return success(
                    request.requestId
                );
            }


            /**
             * ----------------------------------------------------
             * EXHAUSTIVE CHECK
             * ----------------------------------------------------
             */

            default: {

                const exhaustive:
                    never = request;

                throw new Error(
                    `Unsupported SQLite Worker request: ${String(exhaustive)}`
                );
            }
        }

    } catch (error) {

        return failure(
            request.requestId,
            error
        );
    }
}


/**
 * ================================================================
 * MESSAGE DISPATCH
 * ================================================================
 *
 * No queue.
 *
 * Every message is dispatched immediately.
 *
 * The worker event loop handles synchronous SQLite operations
 * sequentially while independent asynchronous operations can
 * yield without blocking unrelated message delivery.
 */

self.addEventListener(
    "message",
    (event: MessageEvent<SQLiteWorkerRequest>) => {

        void handleRequest(event.data)
            .then(response => {

                self.postMessage(response);

            })
            .catch(error => {

                /**
                 * This should normally never execute because
                 * handleRequest() converts failures into responses.
                 *
                 * It is retained as a final production safety net.
                 */
                self.postMessage(
                    failure(
                        event.data.requestId,
                        error
                    )
                );
            });
    }
);