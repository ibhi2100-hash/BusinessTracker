import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

import {
    databaseIdToKey,
    type DatabaseId,
} from "./DatabaseId";

import {
    WorkerStatementRegistry,
} from "./WorkerStatementRegistry";

export interface WorkerDatabaseContext {
    id: DatabaseId;
    key: string;
    filename: string;
    db: any;
    statements: WorkerStatementRegistry;
}

export class WorkerDatabaseRegistry {

    private sqlite3?: any;

    private readonly databases =
        new Map<string, WorkerDatabaseContext>();

    private initialized = false;

    /**
     * Initialize SQLite WASM and verify that the
     * standard OPFS VFS is available.
     *
     * IMPORTANT:
     * We deliberately do NOT install opfs-sahpool.
     *
     * Standard "opfs" supports concurrent database
     * connections from multiple browser contexts.
     */
    async initializeSQLite(): Promise<void> {

    console.log(
        "[SQLiteWorker] initializeSQLite() START"
    );

    if (this.initialized) {

        console.log(
            "[SQLiteWorker] SQLite already initialized"
        );

        return;
    }

    if (this.sqlite3) {

        console.log(
            "[SQLiteWorker] sqlite3 instance already exists"
        );

        return;
    }

    console.log(
        "[SQLiteWorker] sqlite3ApiConfig: installing..."
    );

    const previousConfig =
        (self as any).sqlite3ApiConfig;

    (self as any).sqlite3ApiConfig = {

        debug: (...args: unknown[]) => {
            console.debug(
                "[SQLite-WASM DEBUG]",
                ...args
            );
        },

        log: (...args: unknown[]) => {
            console.log(
                "[SQLite-WASM LOG]",
                ...args
            );
        },

        warn: (...args: unknown[]) => {
            console.warn(
                "[SQLite-WASM WARN]",
                ...args
            );
        },

        error: (...args: unknown[]) => {
            console.error(
                "[SQLite-WASM ERROR]",
                ...args
            );
        },
    };

    try {

        console.log(
            "[SQLiteWorker] Calling sqlite3InitModule()..."
        );
        console.log(
    "[SQLiteWorker] OPFS environment",
    {
        crossOriginIsolated:
            self.crossOriginIsolated,

        SharedArrayBuffer:
            typeof SharedArrayBuffer !== "undefined",

        Atomics:
            typeof Atomics !== "undefined",

        waitAsync:
            typeof Atomics?.waitAsync === "function",

        origin:
            self.location.origin,
    }
);
        const startedAt =
            performance.now();

        this.sqlite3 =
            await await sqlite3InitModule();
        console.log(
            "[SQLiteWorker] SQLite WASM loaded",
            {
                sqlite3: !!this.sqlite3,
                oo1: !!this.sqlite3?.oo1,
                OpfsDb: !!this.sqlite3?.oo1?.OpfsDb,

                oo1Keys:
                    this.sqlite3?.oo1
                        ? Object.keys(this.sqlite3.oo1)
                        : [],

                version:
                    this.sqlite3?.version?.libVersion,
            }
        );

        console.log(
            "[SQLiteWorker] sqlite3InitModule() SUCCESS",
            {
                elapsedMs:
                    Math.round(
                        performance.now() - startedAt
                    ),

                sqlite3:
                    !!this.sqlite3,

                oo1:
                    !!this.sqlite3?.oo1,

                OpfsDb:
                    !!this.sqlite3?.oo1?.OpfsDb,
            }
        );

    } catch (error) {

        console.error(
            "[SQLiteWorker] sqlite3InitModule() FAILED",
            {
                error,
                name:
                    error instanceof Error
                        ? error.name
                        : typeof error,
                message:
                    error instanceof Error
                        ? error.message
                        : String(error),
                stack:
                    error instanceof Error
                        ? error.stack
                        : undefined,
            }
        );

        this.sqlite3 = undefined;

        throw error;

    } finally {

        console.log(
            "[SQLiteWorker] Restoring sqlite3ApiConfig..."
        );

        if (previousConfig) {

            (self as any).sqlite3ApiConfig =
                previousConfig;

        } else {

            delete (self as any).sqlite3ApiConfig;
        }
    }

    console.log(
        "[SQLiteWorker] Checking sqlite3.oo1.OpfsDb..."
    );

    if (!this.sqlite3?.oo1?.OpfsDb) {

        console.error(
            "[SQLiteWorker] OpfsDb NOT AVAILABLE",
            {
                sqlite3:
                    !!this.sqlite3,

                oo1:
                    !!this.sqlite3?.oo1,

                OpfsDb:
                    !!this.sqlite3?.oo1?.OpfsDb,
            }
        );

        this.sqlite3 = undefined;

        throw new Error(
            "SQLite OPFS VFS is not available."
        );
    }

    console.log(
        "[SQLiteWorker] OpfsDb is available"
    );

    this.initialized = true;

    console.log(
        "[SQLiteWorker] initializeSQLite() COMPLETE"
    );
}

    async open(
        database: DatabaseId,
        filename: string,
        vfs = "opfs",
        debug = false
    ): Promise<WorkerDatabaseContext> {

        await this.initializeSQLite();

        const key =
            databaseIdToKey(database);

        /**
         * One database connection per database identity
         * inside THIS worker.
         */
        const existing =
            this.databases.get(key);

        if (existing) {
            return existing;
        }

        if (!this.sqlite3) {

            throw new Error(
                "SQLite WASM has not been initialized."
            );
        }

        if (!this.sqlite3.oo1?.OpfsDb) {

            throw new Error(
                "SQLite standard OPFS VFS is not available."
            );
        }

        /**
         * Standard OPFS uses the filename directly.
         *
         * Keep the same naming convention as the rest
         * of your application.
         */
        const opfsFilename =
            filename.startsWith("/")
                ? filename
                : `/${filename}`;

        if (debug) {

            console.debug(
                "[BizTru SQLite Worker] opening database",
                {
                    key,
                    database,
                    filename,
                    opfsFilename,
                    requestedVfs: vfs,
                    actualVfs: "opfs",
                }
            );
        }

        let db: any;

        try {

            /**
             * OpfsDb is SQLite's OO1 convenience wrapper
             * around the standard "opfs" VFS.
             */
            db =
                new this.sqlite3.oo1.OpfsDb(
                    opfsFilename
                );

            /**
             * Connection-level configuration.
             */
            db.exec(
                `PRAGMA foreign_keys = ON;`
            );

            /**
             * WAL is important for your architecture because
             * multiple connections may read while another
             * connection writes.
             */
            db.exec(
                `PRAGMA journal_mode = WAL;`
            );

            /**
             * Do not immediately fail when another tab currently
             * owns a SQLite lock.
             */
            db.exec(
                `PRAGMA busy_timeout = 5000;`
            );

            const statements =
                new WorkerStatementRegistry(db);

            const context:
                WorkerDatabaseContext = {
                    id: database,
                    key,
                    filename: opfsFilename,
                    db,
                    statements,
                };

            this.databases.set(
                key,
                context
            );

            if (debug) {

                console.debug(
                    "[BizTru SQLite Worker] opened",
                    {
                        key,
                        filename: opfsFilename,
                        vfs: "opfs",
                    }
                );
            }

            return context;

        } catch (error) {

            try {
                db?.close();
            } catch {}

            throw error;
        }
    }

    get(
        database: DatabaseId
    ): WorkerDatabaseContext {

        const key =
            databaseIdToKey(database);

        const context =
            this.databases.get(key);

        if (!context) {

            throw new Error(
                `SQLite database is not open: ${key}`
            );
        }

        return context;
    }

    has(
        database: DatabaseId
    ): boolean {

        return this.databases.has(
            databaseIdToKey(database)
        );
    }

    close(
        database: DatabaseId
    ): void {

        const key =
            databaseIdToKey(database);

        const context =
            this.databases.get(key);

        if (!context) {
            return;
        }

        try {

            context.statements.clear();

        } finally {

            try {
                context.db.close();
            } finally {
                this.databases.delete(key);
            }
        }
    }

    closeAll(): void {

        for (const context of this.databases.values()) {

            try {
                context.statements.clear();
            } catch {}

            try {
                context.db.close();
            } catch {}
        }

        this.databases.clear();
    }

    get size(): number {
        return this.databases.size;
    }
}