import { StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";
import { BranchStatementDefinition } from "./branch/BranchStatementDefintion";
import { BusinessStatementDefinition } from "./business/BusinessDefiinition";
import { EventStatementsDefinition } from "./events/EventDefinitions";
import { InventoryStatementDefinition } from "./inventory/InventoryStatementDefinition";
import { LogicClockDefinition } from "./logicClock/logicClockDefinition"
import { ProductStatementDefinition } from "./products/productStatementsDefinition";
import { SalesStatementDefinition } from "./sales/salesStatementDefinition";

export const BusinessStatementsDefinitions: StatementDefinition[] = [
    ...BusinessStatementDefinition,
    ...BranchStatementDefinition,
    ...EventStatementsDefinition,
    ...LogicClockDefinition,
    ...ProductStatementDefinition,
    ...InventoryStatementDefinition,
    ...SalesStatementDefinition
]