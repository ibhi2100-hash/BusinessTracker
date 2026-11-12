
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

    private initializationPromise?: Promise<void>;

    private static readonly LOG_PREFIX =
        "[BizTru SQLite Registry]";

    // --------------------------------------------------
    // LOGGING UTILITIES
    // --------------------------------------------------

    private log(
        stage: string,
        details?: unknown
    ): void {

        console.log(
            `${WorkerDatabaseRegistry.LOG_PREFIX} ${stage}`,
            details ?? ""
        );
    }

    private warn(
        stage: string,
        details?: unknown
    ): void {

        console.warn(
            `${WorkerDatabaseRegistry.LOG_PREFIX} ${stage}`,
            details ?? ""
        );
    }

    private error(
        stage: string,
        error: unknown,
        details?: unknown
    ): void {

        const serializedError =
            this.serializeError(error);

        console.error(
            `${WorkerDatabaseRegistry.LOG_PREFIX} ${stage}`,
            {
                ...serializedError,
                details,
            }
        );
    }

    private serializeError(
        error: unknown
    ): Record<string, unknown> {

        if (error instanceof Error) {

            const sqliteError =
                error as Error & {
                    resultCode?: number;
                    code?: string;
                    cause?: unknown;
                };

            return {
                name: sqliteError.name,
                message: sqliteError.message,
                stack: sqliteError.stack,
                resultCode: sqliteError.resultCode,
                code: sqliteError.code,
                cause: sqliteError.cause,
            };
        }

        return {
            type: typeof error,
            value: error,
            message: String(error),
        };
    }

    private elapsed(
        start: number
    ): number {

        return Number(
            (performance.now() - start).toFixed(2)
        );
    }

    // --------------------------------------------------
    // SQLITE ENVIRONMENT DIAGNOSTICS
    // --------------------------------------------------

    private inspectEnvironment(): Record<string, unknown> {

        return {
            
            secureContext:
                self.isSecureContext,

            crossOriginIsolated:
                self.crossOriginIsolated,

            sharedArrayBuffer:
                typeof SharedArrayBuffer !== "undefined",

            opfsAvailable:
                typeof navigator !== "undefined" &&
                typeof navigator.storage?.getDirectory === "function",

            origin:
                self.location?.origin,

            userAgent:
                navigator?.userAgent,
        };
    }

    private inspectSQLite(): Record<string, unknown> {

        const sqlite3 = this.sqlite3;

        const vfsFind =
            sqlite3?.capi?.sqlite3_vfs_find;

        let opfsVfsRegistered: boolean | null = null;

        let vfsError: unknown = null;

        if (typeof vfsFind === "function") {

            try {

                opfsVfsRegistered =
                    Boolean(vfsFind("opfs"));

            } catch (error) {

                vfsError = this.serializeError(error);
            }
        }

        return {
            sqliteLoaded:
                Boolean(sqlite3),

            version:
                sqlite3?.version,

            oo1Available:
                Boolean(sqlite3?.oo1),

            opfsDbAvailable:
                typeof sqlite3?.oo1?.OpfsDb === "function",

            capiAvailable:
                Boolean(sqlite3?.capi),

            vfsFindAvailable:
                typeof vfsFind === "function",

            opfsVfsRegistered,

            vfsError,
        };
    }

    // --------------------------------------------------
    // SQLITE INITIALIZATION
    // --------------------------------------------------

    async initializeSQLite(): Promise<void> {

        if (this.initialized) {

            this.log(
                "INITIALIZATION SKIPPED - ALREADY INITIALIZED",
                this.inspectSQLite()
            );

            return;
        }

        if (this.initializationPromise) {

            this.log(
                "WAITING FOR EXISTING INITIALIZATION"
            );

            return this.initializationPromise;
        }

        if (this.sqlite3) {

            this.warn(
                "SQLITE INSTANCE EXISTS BUT INITIALIZED FLAG IS FALSE"
            );
        }

        this.initializationPromise =
            this.performSQLiteInitialization();

        try {

            await this.initializationPromise;

        } finally {

            this.initializationPromise =
                undefined;
        }
    }

    private async performSQLiteInitialization(): Promise<void> {

        const start = performance.now();

        this.log(
            "INITIALIZATION START",
            this.inspectEnvironment()
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

            this.log(
                "LOADING SQLITE WASM MODULE"
            );

            const moduleStart =
                performance.now();

            this.sqlite3 =
                await sqlite3InitModule();

            this.log(
                "SQLITE WASM MODULE LOADED",
                {
                    durationMs:
                        this.elapsed(moduleStart),

                    sqlite:
                        this.inspectSQLite(),
                }
            );

        } catch (error) {

            this.error(
                "SQLITE WASM MODULE INITIALIZATION FAILED",
                error,
                {
                    environment:
                        this.inspectEnvironment(),
                }
            );

            this.sqlite3 = undefined;

            this.initialized = false;

            throw error;

        } finally {

            if (previousConfig !== undefined) {

                (self as any).sqlite3ApiConfig =
                    previousConfig;

            } else {

                delete (self as any).sqlite3ApiConfig;
            }

            this.log(
                "SQLITE API CONFIG RESTORED"
            );
        }

        const diagnostics =
            this.inspectSQLite();

        this.log(
            "SQLITE API INSPECTION",
            diagnostics
        );

        if (!diagnostics.opfsDbAvailable) {

            this.error(
                "OPFS DATABASE WRAPPER NOT AVAILABLE",
                new Error(
                    "sqlite3.oo1.OpfsDb is not available."
                ),
                diagnostics
            );

            this.sqlite3 = undefined;

            throw new Error(
                "SQLite OPFS database wrapper is not available."
            );
        }

        if (diagnostics.opfsVfsRegistered === false) {

            this.error(
                "STANDARD OPFS VFS NOT REGISTERED",
                new Error(
                    "SQLite VFS 'opfs' was not found."
                ),
                diagnostics
            );

            this.sqlite3 = undefined;

            throw new Error(
                "SQLite standard OPFS VFS is not registered."
            );
        }

        if (diagnostics.opfsVfsRegistered === null) {

            this.warn(
                "OPFS VFS REGISTRATION COULD NOT BE VERIFIED",
                diagnostics
            );
        }

        this.initialized = true;

        this.log(
            "SQLITE INITIALIZATION SUCCESSFUL",
            {
                durationMs:
                    this.elapsed(start),

                sqlite:
                    this.inspectSQLite(),
            }
        );
    }

    // --------------------------------------------------
    // DATABASE OPEN
    // --------------------------------------------------

    async open(
        database: DatabaseId,
        filename: string,
        vfs = "opfs",
        debug = false
    ): Promise<WorkerDatabaseContext> {

        const start = performance.now();

        const key =
            databaseIdToKey(database);

        this.log(
            "DATABASE OPEN REQUEST",
            {
                database,
                key,
                filename,
                requestedVfs: vfs,
                debug,
                currentlyOpen:
                    [...this.databases.keys()],
            }
        );

        try {

            this.log(
                "ENSURING SQLITE INITIALIZED",
                { key }
            );

            await this.initializeSQLite();

            const existing =
                this.databases.get(key);

            if (existing) {

                this.warn(
                    "DATABASE ALREADY OPEN - REUSING CONNECTION",
                    {
                        key,
                        filename: existing.filename,
                    }
                );

                return existing;
            }

            if (!this.sqlite3) {

                throw new Error(
                    "SQLite WASM has not been initialized."
                );
            }

            if (
                typeof this.sqlite3.oo1?.OpfsDb !==
                "function"
            ) {

                throw new Error(
                    "SQLite standard OPFS database wrapper is unavailable."
                );
            }

            const opfsFilename =
                filename.startsWith("/")
                    ? filename
                    : `/${filename}`;

            this.log(
                "DATABASE OPEN PARAMETERS",
                {
                    key,
                    database,
                    originalFilename: filename,
                    opfsFilename,
                    requestedVfs: vfs,
                    actualVfs: "opfs",
                }
            );

            let db: any;

            // ------------------------------------------
            // STEP 1: CREATE OPFS DATABASE CONNECTION
            // ------------------------------------------

            const constructorStart =
                performance.now();

            this.log(
                "OPFS DATABASE CONSTRUCTOR START",
                {
                    key,
                    opfsFilename,
                }
            );

            try {

                db =
                    new this.sqlite3.oo1.OpfsDb(
                        opfsFilename
                    );

                this.log(
                    "OPFS DATABASE CONSTRUCTOR SUCCESS",
                    {
                        key,
                        durationMs:
                            this.elapsed(constructorStart),
                        dbAvailable:
                            Boolean(db),
                        dbType:
                            db?.constructor?.name,
                    }
                );

            } catch (error) {

                this.error(
                    "OPFS DATABASE CONSTRUCTOR FAILED",
                    error,
                    {
                        key,
                        opfsFilename,
                        sqlite:
                            this.inspectSQLite(),
                    }
                );

                throw error;
            }

            // ------------------------------------------
            // STEP 2: FOREIGN KEYS
            // ------------------------------------------

            try {

                this.log(
                    "ENABLING FOREIGN KEYS",
                    { key }
                );

                db.exec(
                    "PRAGMA foreign_keys = ON;"
                );

                this.log(
                    "FOREIGN KEYS CONFIGURED",
                    { key }
                );

            } catch (error) {

                this.error(
                    "FOREIGN KEY CONFIGURATION FAILED",
                    error,
                    { key }
                );

                throw error;
            }

            // ------------------------------------------
            // STEP 3: JOURNAL MODE
            // ------------------------------------------

            try {

                this.log(
                    "SETTING JOURNAL MODE TO WAL",
                    { key }
                );

                const journalResult =
                    db.selectValue(
                        "PRAGMA journal_mode = WAL;"
                    );

                this.log(
                    "JOURNAL MODE RESULT",
                    {
                        key,
                        result: journalResult,
                    }
                );

                if (
                    String(journalResult).toLowerCase() !==
                    "wal"
                ) {

                    this.warn(
                        "SQLITE DID NOT CONFIRM WAL MODE",
                        {
                            key,
                            actualJournalMode:
                                journalResult,
                            expectedJournalMode: "wal",
                        }
                    );
                }

            } catch (error) {

                this.error(
                    "WAL JOURNAL MODE CONFIGURATION FAILED",
                    error,
                    { key }
                );

                throw error;
            }

            // ------------------------------------------
            // STEP 4: BUSY TIMEOUT
            // ------------------------------------------

            try {

                this.log(
                    "SETTING BUSY TIMEOUT",
                    {
                        key,
                        timeoutMs: 5000,
                    }
                );

                db.exec(
                    "PRAGMA busy_timeout = 5000;"
                );

                this.log(
                    "BUSY TIMEOUT CONFIGURED",
                    {
                        key,
                        actualTimeout:
                            db.selectValue(
                                "PRAGMA busy_timeout;"
                            ),
                    }
                );

            } catch (error) {

                this.error(
                    "BUSY TIMEOUT CONFIGURATION FAILED",
                    error,
                    { key }
                );

                throw error;
            }

            // ------------------------------------------
            // STEP 5: CONNECTION DIAGNOSTICS
            // ------------------------------------------

            try {

                const diagnostics = {

                    foreignKeys:
                        db.selectValue(
                            "PRAGMA foreign_keys;"
                        ),

                    journalMode:
                        db.selectValue(
                            "PRAGMA journal_mode;"
                        ),

                    busyTimeout:
                        db.selectValue(
                            "PRAGMA busy_timeout;"
                        ),

                    databaseList:
                        db.exec({
                            sql: "PRAGMA database_list;",
                            rowMode: "array",
                            returnValue: "resultRows",
                        }),

                    sqliteVersion:
                        db.selectValue(
                            "SELECT sqlite_version();"
                        ),
                };

                this.log(
                    "DATABASE CONNECTION DIAGNOSTICS",
                    {
                        key,
                        diagnostics,
                    }
                );

            } catch (error) {

                this.error(
                    "DATABASE DIAGNOSTICS FAILED",
                    error,
                    { key }
                );

                throw error;
            }

            // ------------------------------------------
            // STEP 6: STATEMENT REGISTRY
            // ------------------------------------------

            this.log(
                "CREATING STATEMENT REGISTRY",
                { key }
            );

            const statements =
                new WorkerStatementRegistry(db);

            this.log(
                "STATEMENT REGISTRY CREATED",
                { key }
            );

            // ------------------------------------------
            // STEP 7: REGISTER DATABASE
            // ------------------------------------------

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

            this.log(
                "DATABASE REGISTERED",
                {
                    key,
                    filename: opfsFilename,
                    vfs: "opfs",
                    openDatabaseCount:
                        this.databases.size,
                    openDatabaseKeys:
                        [...this.databases.keys()],
                    durationMs:
                        this.elapsed(start),
                }
            );

            if (debug) {

                this.log(
                    "DATABASE OPEN COMPLETE",
                    {
                        key,
                        filename: opfsFilename,
                        vfs: "opfs",
                    }
                );
            }

            return context;

        } catch (error) {

            this.error(
                "DATABASE OPEN FAILED",
                error,
                {
                    database,
                    key,
                    filename,
                    durationMs:
                        this.elapsed(start),
                    openDatabaseKeys:
                        [...this.databases.keys()],
                }
            );

            throw error;
        }
    }

    // --------------------------------------------------
    // DATABASE GET
    // --------------------------------------------------

    get(
        database: DatabaseId
    ): WorkerDatabaseContext {

        const key =
            databaseIdToKey(database);

        this.log(
            "DATABASE GET REQUEST",
            {
                key,
                available:
                    this.databases.has(key),
                openDatabaseKeys:
                    [...this.databases.keys()],
            }
        );

        const context =
            this.databases.get(key);

        if (!context) {

            const error = new Error(
                `SQLite database is not open: ${key}`
            );

            this.error(
                "DATABASE GET FAILED",
                error,
                {
                    key,
                    availableDatabases:
                        [...this.databases.keys()],
                }
            );

            throw error;
        }

        return context;
    }

    // --------------------------------------------------
    // DATABASE EXISTS
    // --------------------------------------------------

    has(
        database: DatabaseId
    ): boolean {

        const key =
            databaseIdToKey(database);

        const exists =
            this.databases.has(key);

        this.log(
            "DATABASE EXISTS CHECK",
            {
                key,
                exists,
            }
        );

        return exists;
    }

    // --------------------------------------------------
    // DATABASE CLOSE
    // --------------------------------------------------

    close(
        database: DatabaseId
    ): void {

        const key =
            databaseIdToKey(database);

        this.warn(
            "DATABASE CLOSE REQUEST",
            {
                database,
                key,
                exists:
                    this.databases.has(key),
                databases:
                    [...this.databases.keys()],
                stack:
                    new Error(
                        "SQLite close requested"
                    ).stack,
            }
        );

        const context =
            this.databases.get(key);

        if (!context) {

            this.warn(
                "DATABASE ALREADY CLOSED",
                { key }
            );

            return;
        }

        try {

            this.log(
                "CLEARING STATEMENT REGISTRY",
                { key }
            );

            context.statements.clear();

            this.log(
                "STATEMENT REGISTRY CLEARED",
                { key }
            );

        } catch (error) {

            this.error(
                "STATEMENT REGISTRY CLEANUP FAILED",
                error,
                { key }
            );

        } finally {

            try {

                this.log(
                    "CLOSING SQLITE CONNECTION",
                    { key }
                );

                context.db.close();

                this.log(
                    "SQLITE CONNECTION CLOSED",
                    { key }
                );

            } catch (error) {

                this.error(
                    "SQLITE CONNECTION CLOSE FAILED",
                    error,
                    { key }
                );

            } finally {

                this.databases.delete(key);

                this.warn(
                    "DATABASE REMOVED FROM REGISTRY",
                    {
                        key,
                        remaining:
                            [...this.databases.keys()],
                    }
                );
            }
        }
    }

    // --------------------------------------------------
    // CLOSE ALL DATABASES
    // --------------------------------------------------

    closeAll(): void {

        this.warn(
            "CLOSE ALL DATABASES REQUEST",
            {
                count:
                    this.databases.size,
                databases:
                    [...this.databases.keys()],
            }
        );

        for (
            const [key, context]
            of [...this.databases.entries()]
        ) {

            this.log(
                "CLOSING DATABASE",
                { key }
            );

            try {

                context.statements.clear();

            } catch (error) {

                this.error(
                    "STATEMENT CLEANUP FAILED",
                    error,
                    { key }
                );
            }

            try {

                context.db.close();

            } catch (error) {

                this.error(
                    "DATABASE CLOSE FAILED",
                    error,
                    { key }
                );
            }
        }

        this.databases.clear();

        this.log(
            "ALL DATABASES CLOSED",
            {
                remaining:
                    this.databases.size,
            }
        );
    }

    // --------------------------------------------------
    // DATABASE COUNT
    // --------------------------------------------------

    get size(): number {

        const count =
            this.databases.size;

        this.log(
            "DATABASE COUNT REQUEST",
            { count }
        );

        return count;
    }
}
