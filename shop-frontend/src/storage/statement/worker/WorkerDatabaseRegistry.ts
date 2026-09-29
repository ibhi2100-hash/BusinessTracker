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

        if (this.initialized) {
            return;
        }

        if (this.sqlite3) {
            return;
        }

        const previousConfig =
            (self as any).sqlite3ApiConfig;

        (self as any).sqlite3ApiConfig = {
            debug: () => {},
            log: () => {},
            warn: () => {},
            error: () => {},
        };

        try {

            this.sqlite3 =
                await sqlite3InitModule();

        } finally {

            if (previousConfig) {
                (self as any).sqlite3ApiConfig =
                    previousConfig;
            } else {
                delete (self as any).sqlite3ApiConfig;
            }
        }

        /**
         * Standard OPFS VFS is exposed through
         *
         * sqlite3.oo1.OpfsDb
         */
        if (!this.sqlite3?.oo1?.OpfsDb) {

            this.sqlite3 = undefined;

            throw new Error(
                "SQLite OPFS VFS is not available. " +
                "Ensure sqlite3 WASM is running inside a Worker " +
                "and the browser supports OPFS."
            );
        }

        this.initialized = true;
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