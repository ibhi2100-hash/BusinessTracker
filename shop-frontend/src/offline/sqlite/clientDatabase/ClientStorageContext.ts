// src/offline/sqlite/client/ClientStorageContext.ts
import { IConnectionManager } from "../connectionManager/ConnetionContract";
import { ClientConnection } from "./ClientConnection" 

export class StorageContext {

    constructor(
        private readonly connection: IConnectionManager
    ) {}

    /**
     * Returns the active SQLite database.
     */
    get database() {

        return this.connection.database();

    }

    /**
     * Returns the connection manager.
     */
    get connectionManager() {

        return this.connection;

    }

    /**
     * Indicates whether the database is open.
     */
    get isOpen(): boolean {

        return this.connection.isOpen();

    }

}