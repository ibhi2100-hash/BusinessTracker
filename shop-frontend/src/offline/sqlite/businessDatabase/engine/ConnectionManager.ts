// ConnectionManager.ts

import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { IConnectionManager } from "../../types/IStorageContext";

export class BusinessConnection implements IConnectionManager {

    private sqlite3: any;

    private pool: any;

    private currentDB: any = null;

    private currentNodeId: string | null = null;

    private async initializeSQLite() {

    if (this.sqlite3) return;

    this.sqlite3 = await sqlite3InitModule();

    this.pool =
        await this.sqlite3.installOpfsSAHPoolVfs({

            initialCapacity: 8

        });

    console.log(
        "[ConnectionManager] SQLite Ready"
    );
}  
constructor(
    private readonly nodeId: string
){}

    async open(
        
) {

    await this.initializeSQLite();

    if (
        this.currentNodeId === this.nodeId &&
        this.currentDB
    ) {
        return;
    }

    await this.close();

    const filename =
        `/node-${this.nodeId}.db`;

    this.currentDB =
        new this.pool.OpfsSAHPoolDb(
            filename,
            "c"
        );

    this.currentNodeId =
        this.nodeId;

    console.log(
        `[ConnectionManager] Opened ${filename}`
    );

}
    async close() {

    if (!this.currentDB)
        return;

    this.currentDB.close();

    this.currentDB = null;

    this.currentNodeId = null;

}

    getDatabase() {

        if (!this.currentDB) {

            throw new Error(
                "No Business Node is open."
            );

        }

        return this.currentDB;

    }

    isOpen() {

        return this.currentDB !== null;

    }

    currentNode() {

        return this.currentNodeId;

    }

    async databaseInfo() {

    const db = this.getDatabase();

    const rows: any[] = [];

    db.exec({

        sql: `
            SELECT *
            FROM schema_version
        `,

        rowMode: "object",

        callback(row) {

            rows.push(row);

        }

    });

    return rows;
}


}