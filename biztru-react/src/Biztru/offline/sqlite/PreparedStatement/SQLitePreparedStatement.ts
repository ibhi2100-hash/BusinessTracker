import { SQLiteRuntime } from "../../../storage/runtime/SQLiteRuntime"; 
import type{ PreparedStatement } from "./PreparedStatementContract";
import type{ PreparedStatementManager } from "./PreparedStatementManager";
import type{ StatementDefinition } from "./StatementRegistry/statementDefinition";
import { WorkerPreparedStatement } from "../../../storage/runtime/SQLiteWorkerClient"; 
import type{ DatabaseId } from "../../../storage/statement/worker/DatabaseId";


export class SQLitePreparedStatementManager
implements PreparedStatementManager {

    private readonly statements =
        new Map<string, PreparedStatement>();

    private readonly runtime: SQLiteRuntime;
    private readonly database: DatabaseId;
    constructor(
        runtime: SQLiteRuntime,
        database: DatabaseId
    ) {
        this.runtime = runtime;

        this.database = database
    }

    initialize(
        defs: StatementDefinition[]
    ): void {

        this.clear();

        for (const def of defs) {

            const statement =
                new WorkerPreparedStatement(
                    this.runtime,
                    this.database,
                    def.key
                );

            this.statements.set(
                def.key,
                statement
            );
        }
    }

    get(key: string): PreparedStatement {

        const statement =
            this.statements.get(key);

        if (!statement) {
            throw new Error(
                `Prepared statement not registered: ${key}`
            );
        }

        return statement;
    }

    clear(): void {

        for (const statement of this.statements.values()) {
            statement.dispose();
        }

        this.statements.clear();
    }
}