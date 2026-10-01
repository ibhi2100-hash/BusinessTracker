import type { PreparedStatement } from "./PreparedStatementContract";
import type { StatementDefinition } from "./StatementRegistry/statementDefinition";

export interface PreparedStatementManager {
    get(key: string): PreparedStatement;
    initialize(
        defs: StatementDefinition[]
    ): void;
    clear():void
}