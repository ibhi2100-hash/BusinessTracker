import { DatabaseInfo } from "../database/databaseInformation";
import { PreparedStatement } from "../PreparedStatement/PreparedStatementContract";

export interface IConnectionManager {

    open(): Promise<void>;

    close(): Promise<void>;

    getDatabase(): any;

    isOpen(): boolean;

    databaseInfo(): Promise<DatabaseInfo>;

    prepare(
        sql: string
    ): PreparedStatement;
}