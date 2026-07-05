// IConnectionManager.ts

import { DatabaseInfo } from "../database/databaseInformation";

export interface IConnectionManager {

    open(): Promise<void>;

    close(): Promise<void>;

    database(): any;

    isOpen(): boolean;

    databaseInfo(): Promise<DatabaseInfo>;

}