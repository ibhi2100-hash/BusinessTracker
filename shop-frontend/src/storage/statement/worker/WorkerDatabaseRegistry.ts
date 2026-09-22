import sqlite3InitModule from "@sqlite.org/sqlite-wasm";

import {
    databaseIdToKey,
    type DatabaseId,
} from "./DatabaseId";

import {
    WorkerStatementRegistry,
} from "./WorkerStatementRegistry";
import { WorkerRequest } from "@/src/offline/sqlite/protocol/WorkerRequest";


export interface SQLiteInitializationOptions
extends WorkerRequest {

}

export interface WorkerDatabaseContext {

    id: DatabaseId;

    key: string;

    filename: string;

    db: any;

    statements: WorkerStatementRegistry;
}

export class WorkerDatabaseRegistry {

    private sqlite3?: any;
    private sahPoolUtil?: any;          // ← add this
    private readonly databases = new Map<string, WorkerDatabaseContext>();

    async initializeSQLite(): Promise<void> {
        if (this.sqlite3) {
            return;
        }

        // Silence classic OPFS / OPFS-WL installation noise.
        // We only use opfs-sahpool.
        const previousConfig = (self as any).sqlite3ApiConfig;
        (self as any).sqlite3ApiConfig = {
            debug: () => {},
            log: () => {},
            warn: () => {},
            error: () => {},
        };

        try {
            this.sqlite3 = await sqlite3InitModule();

            this.sahPoolUtil = await this.sqlite3.installOpfsSAHPoolVfs({
                initialCapacity: 64,
                // optional but useful:
                // directory: "/biztru-sqlite",   // isolate from other apps
                // clearOnInit: false,
            });
        } finally {
            // Restore whatever was there (or remove it)
            if (previousConfig) {
                (self as any).sqlite3ApiConfig = previousConfig;
            } else {
                delete (self as any).sqlite3ApiConfig;
            }
        }
    }
    async open(
        database: DatabaseId,
        filename: string,
        vfs?: string,
        debug = false
    ): Promise<WorkerDatabaseContext> {

        await this.initializeSQLite();

        const key =
            databaseIdToKey(database);

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

        if (!this.sahPoolUtil?.OpfsSAHPoolDb) {
            throw new Error(
                "SQLite opfs-sahpool VFS is not available."
            );
        }

        const sahFilename =
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
                    sahFilename,
                    requestedVfs: vfs,
                    actualVfs: "opfs-sahpool",
                }
            );
        }

        let db: any;

        try {

            db =
                new this.sahPoolUtil.OpfsSAHPoolDb(
                    sahFilename
                );

            db.exec(
                `PRAGMA foreign_keys = ON;`
            );

            db.exec(
                `PRAGMA journal_mode = WAL;`
            );

            db.exec(
                `PRAGMA busy_timeout = 5000;`
            );

            const statements =
                new WorkerStatementRegistry(db);

            const context:
                WorkerDatabaseContext = {
                    id: database,
                    key,
                    filename: sahFilename,
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
                        filename: sahFilename,
                        vfs: "opfs-sahpool",
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

        context.statements.clear();

        try {
            context.db.close();
        } finally {
            this.databases.delete(key);
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