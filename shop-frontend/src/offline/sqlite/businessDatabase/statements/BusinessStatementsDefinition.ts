import { StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";
import { BranchStatementDefinition } from "./branch/BranchStatementDefintion";
import { BusinessStatementDefinition } from "./business/BusinessDefiinition";
import { DashboardStatementDefinition } from "./dashboard/dashboardStatementsDefinition";
import { EventStatementsDefinition } from "./events/EventDefinitions";
import { InventoryStatementDefinition } from "./inventory/InventoryStatementDefinition";
import { LedgerStatementDefinition } from "./ledger/ledgerStatementDefinition";
import { LogicClockDefinition } from "./logicClock/logicClockDefinition"
import { ProductStatementDefinition } from "./products/productStatementsDefinition";
import { ReportStatementDefinition } from "./report/reportStatementDefinition";
import { SalesStatementDefinition } from "./sales/salesStatementDefinition";

export const BusinessStatementsDefinitions: StatementDefinition[] = [
    ...BusinessStatementDefinition,
    ...BranchStatementDefinition,
    ...EventStatementsDefinition,
    ...LogicClockDefinition,
    ...ProductStatementDefinition,
    ...InventoryStatementDefinition,
    ...SalesStatementDefinition,
    ...LedgerStatementDefinition,
    ...DashboardStatementDefinition,
    ...ReportStatementDefinition
]