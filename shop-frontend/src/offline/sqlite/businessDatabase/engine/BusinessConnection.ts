import { IConnectionManager } from "../../types/IStorageContext";
import { SQLitePreparedStatement } from "../../PreparedStatement/SQLitePreparedStatement";
import { PreparedStatement } from "../../PreparedStatement/PreparedStatementContract";

export class BusinessConnection implements IConnectionManager {

    private currentDB: any = null;

    constructor(
        private readonly nodeId: string,
        private readonly pool: any
    ) {}

    async open(): Promise<void> {

        if (this.currentDB) {
            return;
        }

        const filename = `/node-${this.nodeId}.db`;

        this.currentDB =
            new this.pool.OpfsSAHPoolDb(
                filename,
                "c"
            );

        console.log(
            `[BusinessConnection] Opened ${filename}`
        );
    }

    async close(): Promise<void> {

        if (!this.currentDB) {
            return;
        }

        this.currentDB.close();
        this.currentDB = null;
    }

    getDatabase() {

        if (!this.currentDB) {
            throw new Error(
                `Database ${this.nodeId} is not open.`
            );
        }

        return this.currentDB;
    }

    isOpen(): boolean {
        return this.currentDB !== null;
    }

    currentNode(): string {
        return this.nodeId;
    }

    prepare(sql: string): PreparedStatement {
        return new SQLitePreparedStatement(
            this.getDatabase().prepare(sql)
        );
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
            callback(row: any) {
                rows.push(row);
            }
        });

        return rows;
    }
}