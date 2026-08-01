import { StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";
import { BusinessStatementDefinition } from "./business/BusinessDefiinition";
import { EventStatementsDefinition } from "./events/EventDefinitions";
import { LogicClockDefinition } from "./logicClock/logicClockDefinition"

export const BusinessStatementsDefinitions: StatementDefinition[] = [
    ...BusinessStatementDefinition,
    ...EventStatementsDefinition,
    ...LogicClockDefinition
]