import { PreparedStatement } from "./PreparedStatementContract";
import { StatementDefinition } from "./StatementRegistry/statementDefinition";

export interface PreparedStatementManager {
    get(key: string): PreparedStatement;
    initialize(
        defs: StatementDefinition[]
    ): void;
    clear():void
}