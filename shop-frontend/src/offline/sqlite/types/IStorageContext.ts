import { DatabaseInfo } from "../database/databaseInformation";

export interface IConnectionManager {

    open(): Promise<void>;

    close(): Promise<void>;

    getDatabase(): any;

    isOpen(): boolean;

    databaseInfo(): Promise<DatabaseInfo>;
}