import { SQLiteRuntime } from "@/src/storage/runtime/SQLiteRuntime";
import { PreparedStatement } from "./PreparedStatementContract";
import { PreparedStatementManager } from "./PreparedStatementManager";
import { StatementDefinition } from "./StatementRegistry/statementDefinition";
import { WorkerPreparedStatement } from "@/src/storage/statement/WorkerPreparedStatement";

export class SQLitePreparedStatementManager
implements PreparedStatementManager {

    private readonly statements =
        new Map<string, PreparedStatement>();

    constructor(
        private readonly runtime: SQLiteRuntime
    ) {}

    initialize(
        defs: StatementDefinition[]
    ): void {

        this.clear();

        for (const def of defs) {

            const statement =
                new WorkerPreparedStatement(
                    this.runtime,
                    def.key
                );

            this.statements.set(
                def.key,
                statement
            );
        }
    }

    get(
        key: string
    ): PreparedStatement {

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

        for (
            const statement
            of this.statements.values()
        ) {
            statement.dispose();
        }

        this.statements.clear();
    }
}