import type{ StatementDefinition } from "../../PreparedStatement/StatementRegistry/statementDefinition";
import { AggregateStatementDefinition } from "./aggregates/aggregateStatementDefinition";
import { BillingEntitlementStatementDefinition } from "./billing/entitlements/billingEntitlementStatementDefinition";
import { BillingInvoiceStatementDefinition } from "./billing/invoices/billingInvoiceStatementDefinition";
import { BillingSubscriptionLeaseStatementDefinition } from "./billing/leases/billingSubscriptionLeaseStatementDefinition";
import { BillingEntitlementOverrideStatementDefinition } from "./billing/overrides/billingEntitlementOverrideStatementDefinition";
import { BillingPaymentStatementDefinition } from "./billing/payments/billingPaymentStatementDefinition";
import { BillingPlanStatementDefinition } from "./billing/plans/billingPlanStatementDefinition";
import { BillingPlanVersionStatementDefinition } from "./billing/planVersions/billingPlanVersionStatementDefinition";
import { BillingSubscriptionRequestStatementDefinition } from "./billing/requests/billingSubscriptionRequestStatementDefinition";
import { BillingSubscriptionStatementDefinition } from "./billing/subscriptions/billingSubscriptionStatementDefinition";
import { BranchStatementDefinition } from "./branch/BranchStatementDefintion";
import { BusinessStatementDefinition } from "./business/BusinessDefiinition";
import { ConflictStatementDefinition } from "./conflicts/conflictsStatementDefinition";
import { SyncCursorStatementsDefinition } from "./cursor/CursorStatementsDefinition";
import { BranchDashboardStatementDefinition } from "./dashboard/branch/dashboardStatementsDefinition";
import { BusinessDashboardStatementDefinition } from "./dashboard/business/BusinessDashboardStatementDefinition";
import { EmployeeStatementDefinitions } from "./employees/employeeStatementDefinition";
import { EventInboxStatementsDefinition } from "./eventInbox/EventInboxStatementsDefinition";
import { EventStatementsDefinition } from "./events/EventDefinitions";
import { ExpenseStatementDefinition } from "./expense/expenseStatementDefinition";
import { InventoryStatementDefinition } from "./inventory/InventoryStatementDefinition";
import { LedgerStatementDefinition } from "./ledger/ledgerStatementDefinition";
import { LogicClockDefinition } from "./logicClock/logicClockDefinition"
import { OutboxStatementsDefinition } from "./outbox/outboxStatementDefinition";
import { ProductStatementDefinition } from "./products/productStatementsDefinition";
import { ProjectionResetStatementDefinitions } from "./projectionRebuilder/projectionRebuilderDefinition";
import { RefundStatementDefinition } from "./refund/refundsStatementDefinition";
import { ReportStatementDefinition } from "./report/reportStatementDefinition";
import { SalesStatementDefinition } from "./sales/salesStatementDefinition";
import { SyncActivityStatementDefinition } from "./syncActivities/ActivitiesStatementDefinition";
import { SyncStateStatementDefinition } from "./syncState/SyncStatementDefinition";

export const BusinessStatementsDefinitions: StatementDefinition[] = [
    ...BusinessStatementDefinition,
    ...BranchStatementDefinition,
    ...EventStatementsDefinition,
    ...LogicClockDefinition,
    ...ProductStatementDefinition,
    ...InventoryStatementDefinition,
    ...SalesStatementDefinition,
    ...RefundStatementDefinition,
    ...ExpenseStatementDefinition,
    ...LedgerStatementDefinition,
    ...BranchDashboardStatementDefinition,
    ...BusinessDashboardStatementDefinition,
    ...ReportStatementDefinition,
    ...OutboxStatementsDefinition,
    ...AggregateStatementDefinition,
    ...SyncStateStatementDefinition,
    ...SyncActivityStatementDefinition,
    ...ConflictStatementDefinition,
    ...ProjectionResetStatementDefinitions,
    ...EmployeeStatementDefinitions,
    ...SyncCursorStatementsDefinition,
    ...EventInboxStatementsDefinition,

    //Billing System
    ...BillingEntitlementStatementDefinition,
    ...BillingInvoiceStatementDefinition,
    ...BillingSubscriptionLeaseStatementDefinition,
    ...BillingEntitlementOverrideStatementDefinition,
    ...BillingPaymentStatementDefinition,
    ...BillingPlanStatementDefinition,
    ...BillingPlanVersionStatementDefinition,
    ...BillingSubscriptionRequestStatementDefinition,
    ...BillingSubscriptionStatementDefinition

]