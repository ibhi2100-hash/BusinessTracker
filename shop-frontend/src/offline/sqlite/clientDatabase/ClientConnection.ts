// ClientConnection.ts

import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { IConnectionManager } from "../types/IStorageContext";

export class ClientConnection implements IConnectionManager{

    private sqlite3: any;

    private db: any;

    private opened: boolean = false;

    async open() {
        

        if (this.db) {

            return;

        }
        

        this.sqlite3 =
            await sqlite3InitModule();

        const pool =
            await this.sqlite3.installOpfsSAHPoolVfs({

                initialCapacity: 4,

            });

        this.db =
            new pool.OpfsSAHPoolDb(

                "/client.db",

                "c"

            );

            this.opened = true;

            console.info(
            "[ClientConnection] Opened:",
            this.db.filename
        );

    }

    getDatabase() {
        if (!this.db) {

            throw new Error(
                "Client database has not been opened."
            );

        }
        return this.db;

    }

    /**
     * Closes the database.
     */
    async close(): Promise<void> {

        if (!this.db) {
            return;
        }

        try {

            this.db.close();

        } finally {

            this.db = null;
            this.sqlite3 = null;
            this.opened = false;

        }

    }

    /**
     * Indicates whether the database is open.
     */
    isOpen(): boolean {

        return this.opened;

    }

    /**
     * Returns basic database metadata.
     */
    async databaseInfo() {

        return {

            filename: "/client.db",

            nodeId: null,

            isOpen: this.opened

        };

    }

}