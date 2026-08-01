import { StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";
import { BusinessStatementDefinition } from "./business/BusinessDefiinition";
import { EventStatementsDefinition } from "./events/EventDefinitions";

export const BusinessStatementsDefinitions: StatementDefinition[] = [
    ...BusinessStatementDefinition,
    ...EventStatementsDefinition
]