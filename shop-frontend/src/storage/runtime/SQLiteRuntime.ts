import type {
    Lifecycle,
} from "@/src/offline/sqlite/lifecycle/LifeCycle";

import type { DatabaseId } from "../statement/worker/DatabaseId";

import type {
    SQLiteWorkerRequest,
    SQLiteWorkerResponse,
    SQLiteStatementOperation,
    SQLiteMigrationOperation,
} from "../statement/worker/WorkerProtocol";

import type { StatementDefinition } from "@/src/offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";

export interface SQLiteRuntimeOptions {
    vfs?: string;
    opfsDirectory?: string;
    debug?: boolean;
}

interface PendingRequest {
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
}

export class SQLiteRuntime implements Lifecycle {

    private worker?: Worker;

    private initialized = false;

    private initializationPromise?: Promise<void>;

    private readonly pending =
        new Map<string, PendingRequest>();

    /**
     * Databases currently opened through this runtime.
     *
     * The actual database ownership remains inside
     * WorkerDatabaseRegistry.
     */
    private readonly databases =
        new Map<string, DatabaseId>();

    constructor(
        private readonly options: SQLiteRuntimeOptions
    ) {}

    get isInitialized(): boolean {
        return this.initialized;
    }

    async initialize(): Promise<void> {
        await this.start();
    }

    async start(): Promise<void> {

        if (this.initialized) {
            return;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise =
            this.startInternal();

        try {
            await this.initializationPromise;
        } finally {
            this.initializationPromise =
                undefined;
        }
    }

    private async startInternal(): Promise<void> {

        if (typeof window === "undefined") {
            throw new Error(
                "SQLiteRuntime can only run in the browser."
            );
        }

        if (typeof Worker === "undefined") {
            throw new Error(
                "Web Workers are not available."
            );
        }
       const worker = new Worker(
            new URL(
                "../statement/worker/sqlite.worker.ts",
                import.meta.url
            ),
            {
                type: "module",
            }
        );

        this.worker = worker;

        worker.addEventListener(
            "message",
            this.handleMessage
        );

        worker.addEventListener(
            "error",
            this.handleWorkerError
        );

        await this.request({
            type: "initialize",

            requestId:
                crypto.randomUUID(),

            vfs:
                this.options.vfs,

            opfsDirectory:
                this.options.opfsDirectory,

            debug:
                this.options.debug,
        });

        this.initialized = true;
    }

    /**
     * Open one logical SQLite database inside
     * this shared SQLite worker.
     */
    async openDatabase(
        database: DatabaseId,
        filename: string
    ): Promise<void> {

        await this.request({
            type: "database.open",

            requestId:
                crypto.randomUUID(),

            database,

            filename,

            vfs:
                this.options.vfs,

            opfsDirectory:
                this.options.opfsDirectory,

            debug:
                this.options.debug,
        });

        const key =
            this.databaseKey(database);

        this.databases.set(
            key,
            database
        );
    }

    /**
     * Close one database without destroying
     * the shared SQLite worker.
     */
    async closeDatabase(
        database: DatabaseId
    ): Promise<void> {

        await this.request({
            type: "database.close",

            requestId:
                crypto.randomUUID(),

            database,
        });

        this.databases.delete(
            this.databaseKey(database)
        );
    }

    hasDatabase(
        database: DatabaseId
    ): boolean {

        return this.databases.has(
            this.databaseKey(database)
        );
    }

    private databaseKey(
        database: DatabaseId
    ): string {

        if (database.type === "client") {
            return "client";
        }

        return `business:${database.businessId}`;
    }

    /**
     * Public deliberately.
     *
     * WorkerPreparedStatement uses this as the
     * single RPC boundary.
     */
    public request<T = unknown>(
        request: SQLiteWorkerRequest
    ): Promise<T> {

        if (!this.worker) {
            return Promise.reject(
                new Error(
                    "SQLiteRuntime has not been started."
                )
            );
        }

        return new Promise<T>(
            (resolve, reject) => {

                this.pending.set(
                    request.requestId,
                    {
                        resolve:
                            resolve as (
                                value: unknown
                            ) => void,

                        reject,
                    }
                );

                try {

                    this.worker!.postMessage(
                        request
                    );

                } catch (error) {

                    this.pending.delete(
                        request.requestId
                    );

                    reject(error);
                }
            }
        );
    }

    async rawExec(
        database: DatabaseId,
        sql: string,
        params: readonly unknown[] = []
    ): Promise<void> {

        await this.request<void>({
            type: "exec",

            requestId:
                crypto.randomUUID(),

            database,

            sql,

            params,
        });
    }

    async rawQuery<T = Record<string, unknown>>(
        database: DatabaseId,
        sql: string,
        params: readonly unknown[] = []
    ): Promise<T[]> {

        return this.request<T[]>({
            type: "query",

            requestId:
                crypto.randomUUID(),

            database,

            sql,

            params,
        });
    }

    async registerStatements(
        database: DatabaseId,
        definitions: StatementDefinition[]
    ): Promise<void> {

        await this.request({
            type: "statements.initialize",

            requestId:
                crypto.randomUUID(),

            database,

            definitions,
        });
    }

    async execute(
        database: DatabaseId,
        statementKey: string,
        params: readonly unknown[] = []
    ): Promise<void> {

        await this.request({
            type: "statement.execute",

            requestId:
                crypto.randomUUID(),

            database,

            statementKey,

            params,
        });
    }

    async query<T = Record<string, unknown>>(
        database: DatabaseId,
        statementKey: string,
        params: readonly unknown[] = []
    ): Promise<T[]> {

        return this.request<T[]>({
            type: "statement.query",

            requestId:
                crypto.randomUUID(),

            database,

            statementKey,

            params,
        });
    }

    async transaction(
        database: DatabaseId,
        operations: readonly SQLiteStatementOperation[]
    ): Promise<void> {

        await this.request({
            type: "transaction",

            requestId:
                crypto.randomUUID(),

            database,

            operations,
        });
    }

    async healthCheck(
        database: DatabaseId
    ): Promise<unknown> {

        return this.request({
            type: "health",

            requestId:
                crypto.randomUUID(),

            database,
        });
    }

    async migrationTransaction(
        database: DatabaseId,
        statements: readonly SQLiteMigrationOperation[]
    ): Promise<void> {

        await this.request({
            type: "migration.transaction",
            requestId: crypto.randomUUID(),
            database,
            statements,
        });
    }

    /**
     * IMPORTANT:
     *
     * Do not clear this.worker before sending
     * database.close requests.
     */
    async stop(): Promise<void> {

        const worker =
            this.worker;

        if (!worker) {
            return;
        }

        /*
         * Close every database while the worker
         * is still available.
         */
        const databases =
            [...this.databases.values()];

        for (const database of databases) {

            try {

                await this.request({
                    type: "database.close",

                    requestId:
                        crypto.randomUUID(),

                    database,
                });

            } catch (error) {

                console.warn(
                    "[SQLiteRuntime] Failed to close database:",
                    database,
                    error
                );
            }
        }

        this.databases.clear();

        /*
         * Only now detach the worker.
         */
        this.worker =
            undefined;

        worker.removeEventListener(
            "message",
            this.handleMessage
        );

        worker.removeEventListener(
            "error",
            this.handleWorkerError
        );

        worker.terminate();

        this.rejectPending(
            new Error(
                "SQLiteRuntime stopped."
            )
        );

        this.initialized = false;
    }

    async dispose(): Promise<void> {
        await this.stop();
    }

    private readonly handleMessage = (
    event: MessageEvent<SQLiteWorkerResponse>
): void => {
    const response = event.data;

    const pending = this.pending.get(
        response.requestId
    );

    if (!pending) {
        return;
    }

    this.pending.delete(
        response.requestId
    );

    if (response.ok === true) {
        pending.resolve(
            response.result
        );

        return;
    }

    // response is now SQLiteWorkerFailure
    const error = new Error(
        response.error.message
    );

    error.name = response.error.name;

    if (response.error.stack) {
        error.stack = response.error.stack;
    }

    pending.reject(error);
};
    private readonly handleWorkerError = (
        event: ErrorEvent
    ): void => {

        const message =
            event.message ||
            (
                event.error instanceof Error
                    ? event.error.message
                    : ""
            ) ||
            "SQLite Worker failed.";

        if (
            message.includes(
                "Expecting vfs=opfs|opfs-wl URL argument for this worker"
            ) ||
            message.includes(
                "Loading OPFS async Worker failed"
            )
        ) {

            console.warn(
                "[SQLiteRuntime] Ignoring expected classic OPFS proxy error:",
                message
            );

            event.preventDefault?.();

            return;
        }

        const error =
            event.error instanceof Error
                ? event.error
                : new Error(message);

        this.rejectPending(error);

        this.initialized = false;
    };

    private rejectPending(
        error: unknown
    ): void {

        for (
            const pending
            of this.pending.values()
        ) {
            pending.reject(error);
        }

        this.pending.clear();
    }
}