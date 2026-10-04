import type { Lifecycle } from "../../offline/sqlite/lifecycle/LifeCycle";

import type { DatabaseId } from "../statement/worker/DatabaseId";

import type {
    SQLiteWorkerRequest,
    SQLiteWorkerResponse,
    SQLiteStatementOperation,
    SQLiteMigrationOperation,
} from "../statement/worker/WorkerProtocol";

import type { StatementDefinition } from "../../offline/sqlite/PreparedStatement/StatementRegistry/statementDefinition";


export interface SQLiteRuntimeOptions {
    vfs?: string;
    opfsDirectory?: string;
    debug?: boolean;
}


interface PendingRequest {
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
}


type SQLiteRuntimeState =
    | "created"
    | "starting"
    | "started"
    | "stopping"
    | "stopped";


export class SQLiteRuntime implements Lifecycle {

    /**
     * ============================================================
     * RUNTIME STATE
     * ============================================================
     */

    private worker: Worker | undefined;

    private state: SQLiteRuntimeState =
        "created";

    private startPromise:
        Promise<void> | undefined;


    /**
     * All outstanding worker RPCs.
     */
    private readonly pending =
        new Map<string, PendingRequest>();


    /**
     * Databases opened by this runtime.
     */
    private readonly databases =
        new Map<string, DatabaseId>();

    private readonly options: SQLiteRuntimeOptions

    constructor(
        options: SQLiteRuntimeOptions
    ) {
        this.options = options
    }


    /**
     * ============================================================
     * STATE
     * ============================================================
     */

    get isInitialized(): boolean {

        return this.state === "started";
    }


    get runtimeState(): SQLiteRuntimeState {

        return this.state;
    }


    /**
     * ============================================================
     * START
     * ============================================================
     */

    async initialize(): Promise<void> {

        await this.start();
    }


    async start(): Promise<void> {

        /**
         * Already running.
         */
        if (this.state === "started") {
            return;
        }


        /**
         * Another caller is already starting us.
         *
         * Everybody shares the same startup Promise.
         */
        if (this.state === "starting") {

            if (!this.startPromise) {

                throw new Error(
                    "SQLiteRuntime is in starting state without a start Promise."
                );
            }

            return this.startPromise;
        }


        /**
         * Don't allow startup while shutting down.
         */
        if (this.state === "stopping") {

            throw new Error(
                "SQLiteRuntime is currently stopping."
            );
        }


        this.state = "starting";


        this.startPromise =
            this.startInternal();


        try {

            await this.startPromise;

            this.state = "started";

        } catch (error) {

            this.state = "stopped";

            this.worker = undefined;

            throw error;

        } finally {

            this.startPromise =
                undefined;
        }
    }


    /**
     * ============================================================
     * INTERNAL STARTUP
     * ============================================================
     */

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


        const worker =
            new Worker(
                new URL(
                    "../statement/worker/sqlite.worker.ts",
                    import.meta.url
                ),
                {
                    type: "module",
                }
            );


        this.worker =
            worker;


        worker.addEventListener(
            "message",
            this.handleMessage
        );


        worker.addEventListener(
            "error",
            this.handleWorkerError
        );


        /**
         * IMPORTANT:
         *
         * Do NOT call this.request() here.
         *
         * request() is a public lifecycle-aware method.
         * Startup itself must use the raw RPC mechanism.
         */
        await this.rawRequest({
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
    }


    /**
     * ============================================================
     * LOW LEVEL RPC
     * ============================================================
     *
     * This method does NOT check runtime lifecycle.
     *
     * It is used internally during startup/shutdown.
     */

    private rawRequest<T = unknown>(
        request: SQLiteWorkerRequest
    ): Promise<T> {

        const worker =
            this.worker;


        if (!worker) {

            return Promise.reject(
                new Error(
                    "SQLite worker is not available."
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

                    worker.postMessage(
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


    /**
     * ============================================================
     * PUBLIC RPC
     * ============================================================
     */

    public async request<T = unknown>(
        request: SQLiteWorkerRequest
    ): Promise<T> {

        /**
         * If startup is already underway, wait for it.
         */
        if (
            this.state === "created" ||
            this.state === "stopped"
        ) {

            await this.start();
        }


        /**
         * If another caller is currently starting the runtime,
         * wait for that same startup operation.
         */
        else if (this.state === "starting") {

            await this.start();
        }


        if (
            this.state !== "started" ||
            !this.worker
        ) {

            throw new Error(
                `SQLiteRuntime is not started. ` +
                `Current state: ${this.state}`
            );
        }


        return this.rawRequest<T>(
            request
        );
    }


    /**
     * ============================================================
     * DATABASE
     * ============================================================
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


        this.databases.set(
            this.databaseKey(database),
            database
        );
    }


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
     * ============================================================
     * RAW SQL
     * ============================================================
     */

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


    /**
     * ============================================================
     * PREPARED STATEMENTS
     * ============================================================
     */

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


    /**
     * ============================================================
     * TRANSACTION
     * ============================================================
     */

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


    /**
     * ============================================================
     * HEALTH
     * ============================================================
     */

   async healthCheck(
        database: DatabaseId
    ): Promise<unknown> {

        return this.request({
            type: "health",
            requestId: crypto.randomUUID(),
            database,
        });
    }

    /**
     * ============================================================
     * MIGRATION
     * ============================================================
     */

    async migrationTransaction(
        database: DatabaseId,
        statements: readonly SQLiteMigrationOperation[]
    ): Promise<void> {

        await this.request({
            type: "migration.transaction",

            requestId:
                crypto.randomUUID(),

            database,

            statements,
        });
    }


    /**
     * ============================================================
     * STOP
     * ============================================================
     */

    async stop(): Promise<void> {

        /**
         * Already stopped.
         */
        if (
            this.state === "stopped" ||
            this.state === "created"
        ) {

            this.state = "stopped";

            return;
        }


        /**
         * Somebody else is already stopping us.
         */
        if (this.state === "stopping") {
            return;
        }


        this.state = "stopping";


        const worker =
            this.worker;


        if (!worker) {

            this.state = "stopped";

            return;
        }


        /**
         * We deliberately DO NOT reject pending requests here
         * before trying to close databases.
         *
         * Doing that makes database.close impossible.
         */


        /**
         * Close databases.
         *
         * If something fails, shutdown still continues.
         */
        const databases =
            [...this.databases.values()];


        for (
            const database
            of databases
        ) {

            try {

                await this.rawRequest({
                    type: "database.close",

                    requestId:
                        crypto.randomUUID(),

                    database,
                });

            } catch {

                // Continue shutdown.
            }
        }


        this.databases.clear();


        /**
         * At this point we are deliberately destroying
         * the worker. Any requests still pending must fail.
         */
        this.rejectPending(
            new Error(
                "SQLiteRuntime stopped."
            )
        );


        worker.removeEventListener(
            "message",
            this.handleMessage
        );


        worker.removeEventListener(
            "error",
            this.handleWorkerError
        );


        worker.terminate();


        this.worker =
            undefined;


        this.state =
            "stopped";
    }


    async dispose(): Promise<void> {

        await this.stop();
    }


    /**
     * ============================================================
     * WORKER MESSAGE
     * ============================================================
     */

    private readonly handleMessage = (
        event: MessageEvent<SQLiteWorkerResponse>
    ): void => {

        const response =
            event.data;


        const pending =
            this.pending.get(
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


        const error =
            new Error(
                response.error.message
            );


        error.name =
            response.error.name;


        if (response.error.stack) {

            error.stack =
                response.error.stack;
        }


        pending.reject(
            error
        );
    };


    /**
     * ============================================================
     * WORKER FAILURE
     * ============================================================
     */

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


        /**
         * The worker is no longer usable.
         */
        const worker =
            this.worker;


        this.worker =
            undefined;


        this.state =
            "stopped";


        this.rejectPending(
            error
        );


        if (worker) {

            worker.removeEventListener(
                "message",
                this.handleMessage
            );

            worker.removeEventListener(
                "error",
                this.handleWorkerError
            );
        }
    };


    /**
     * ============================================================
     * REJECT PENDING
     * ============================================================
     */

    private rejectPending(
        error: unknown
    ): void {

        for (
            const pending
            of this.pending.values()
        ) {

            pending.reject(
                error
            );
        }


        this.pending.clear();
    }
}


/**
 * =================================================================
 * SHARED RUNTIME
 * =================================================================
 *
 * There must be ONE runtime instance for the application.
 */

let sharedRuntime:
    SQLiteRuntime | undefined;


let sharedRuntimePromise:
    Promise<SQLiteRuntime> | undefined;


export function getSharedRuntime(
    options: SQLiteRuntimeOptions
): Promise<SQLiteRuntime> {

    /**
     * Existing healthy runtime.
     */
    if (
        sharedRuntime &&
        sharedRuntime.isInitialized
    ) {

        return Promise.resolve(
            sharedRuntime
        );
    }


    /**
     * Existing startup operation.
     */
    if (sharedRuntimePromise) {

        return sharedRuntimePromise;
    }


    /**
     * Create exactly one runtime.
     */
    const runtime =
        new SQLiteRuntime(
            options
        );


    sharedRuntimePromise =
        runtime.start()
            .then(() => {

                sharedRuntime =
                    runtime;

                return runtime;

            })
            .catch(error => {

                /**
                 * Do not leave a rejected startup Promise
                 * permanently poisoning the singleton.
                 */
                sharedRuntime =
                    undefined;

                throw error;

            })
            .finally(() => {

                sharedRuntimePromise =
                    undefined;
            });


    return sharedRuntimePromise;
}


/**
 * =================================================================
 * SHARED RUNTIME SHUTDOWN
 * =================================================================
 *
 * Do not call runtime.stop() directly from arbitrary services.
 */

export async function stopSharedRuntime(): Promise<void> {

    const runtime =
        sharedRuntime;


    sharedRuntime =
        undefined;


    sharedRuntimePromise =
        undefined;


    if (runtime) {

        await runtime.stop();
    }
}