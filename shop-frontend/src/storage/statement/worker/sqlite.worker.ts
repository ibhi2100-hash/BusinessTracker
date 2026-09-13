import {
    WorkerDatabaseRegistry,
} from "./WorkerDatabaseRegistry";

import type {
    SQLiteWorkerRequest,
    SQLiteWorkerResponse,
    SQLiteStatementOperation,
} from "./WorkerProtocol";


const databases =
    new WorkerDatabaseRegistry();


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

    bindStatement(statement, params);

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

    bindStatement(statement, params);

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
                row[columnNames[i]] = values[i];
            }

            rows.push(row as T);
        }

        return rows;

    } finally {

        statement.reset(true);
    }
}


async function handleRequest(
    request: SQLiteWorkerRequest
): Promise<SQLiteWorkerResponse> {

    try {

        switch (request.type) {

            // ========================================================
            // INITIALIZE SQLITE ENGINE + VFS
            // ========================================================

            case "initialize": {

                await databases.initializeSQLite();

                return success(
                    request.requestId
                );
            }


            // ========================================================
            // OPEN ONE DATABASE
            // ========================================================

            case "database.open": {

                const context =
                    await databases.open(
                        request.database,
                        request.filename,
                        undefined,
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


            // ========================================================
            // CLOSE ONE DATABASE
            // ========================================================

            case "database.close": {

                databases.close(
                    request.database
                );

                return success(
                    request.requestId
                );
            }


            // ========================================================
            // RAW EXEC
            // ========================================================

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


            // ========================================================
            // RAW QUERY
            // ========================================================

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


            // ========================================================
            // INITIALIZE PREPARED STATEMENTS FOR ONE DATABASE
            // ========================================================

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


            // ========================================================
            // PREPARED STATEMENT EXECUTE
            // ========================================================

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


            // ========================================================
            // PREPARED STATEMENT QUERY
            // ========================================================

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


            // ========================================================
            // TRANSACTION
            // ========================================================

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


            // ========================================================
            // HEALTH CHECK
            // ========================================================

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


function runTransaction(
    db: any,
    statements: any,
    operations: SQLiteStatementOperation[]
): void {

    db.exec("BEGIN IMMEDIATE");

    try {

        for (const operation of operations) {

            const statement =
                statements.get(
                    operation.statementKey
                );

            executeStatement(
                statement,
                operation.params
            );
        }

        db.exec("COMMIT");

    } catch (error) {

        try {
            db.exec("ROLLBACK");
        } catch {}

        throw error;
    }
}


self.addEventListener(
    "message",
    async (
        event: MessageEvent<SQLiteWorkerRequest>
    ) => {

        const request =
            event.data;

        const response =
            await handleRequest(request);

        self.postMessage(response);
    }
);