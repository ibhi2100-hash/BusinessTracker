
import { BranchStatements } from "./branch/BranchStatements";
import { BusinessStatements } from "./business/BusinessStatements";
import { EventStatements } from "./events/EventStatements";
import { InventoryStatements } from "./inventory/InventoryStatements";
import { ProductStatements } from "./products/ProductStatements";
import type{ PreparedStatementManager } from "../../PreparedStatement/PreparedStatementManager";
import { LogicClockStatements } from "./logicClock/logicClockStatements"
import { SalesStatement } from "./sales/salesStatements";
import { LedgerStatements } from "./ledger/LedgerStatements";
import { DashboardStatements } from "./dashboard/branch/dashboardStatements";
import { ReportStatements } from "./report/reportStatements";
import { OutboxStatments } from "./outbox/outboxStatements";
import { AggregateStatements } from "./aggregates/aggregateStatements";
import { SyncStateStatements } from "./syncState/SyncStatements";
import { ExpenseStatement } from "./expense/expenseStatements";
import { ConflictsStatements } from "./conflicts/conflictsStatement";
import { SyncActivityStatements } from "./syncActivities/ActivityStatements";
import { EmployeeStatements } from "./employees/employeesStatements";
import { EventInboxStatements } from "./eventInbox/EventInboxStatements";
import { SyncCursorStatements } from "./cursor/CursorStatement";
import { BusinessDashboardStatements } from "./dashboard/business/BusinessStatements";
import { RefundStatement } from "./refund/refundsStatements";
import { BillingEntitlementStatement } from "./billing/entitlements/billingEntitlementStatements";
import { BillingInvoiceStatement } from "./billing/invoices/billingInvoiceStatements";
import { BillingSubscriptionLeaseStatement } from "./billing/leases/billingSubscriptionLeaseStatements";
import { BillingEntitlementOverrideStatement } from "./billing/overrides/billingEntitlementOverrideStatements";
import { BillingPaymentStatement } from "./billing/payments/billingPaymentStatements";
import { BillingPlanStatement } from "./billing/plans/billingPlanStatements";
import { BillingPlanVersionStatement } from "./billing/planVersions/billingPlanVersionStatements";
import { BillingSubscriptionRequestStatement } from "./billing/requests/billingSubscriptionRequestStatements";
import { BillingSubscriptionStatement } from "./billing/subscriptions/billingSubscriptionStatements";




export class BusinessStatementRegistry {
    readonly events: EventStatements;
    readonly eventInbox: EventInboxStatements;
    readonly inventory: InventoryStatements;
    readonly products: ProductStatements;
    readonly sales: SalesStatement;
    readonly refund: RefundStatement;
    readonly expenses: ExpenseStatement;
    readonly employees: EmployeeStatements;
    readonly ledger: LedgerStatements;
    readonly business: BusinessStatements;
    readonly branches: BranchStatements;
    readonly dashboard: DashboardStatements;
    readonly businessDashboard: BusinessDashboardStatements
    readonly report: ReportStatements;
    readonly outbox: OutboxStatments;
    readonly aggregates: AggregateStatements;
    readonly logicClock: LogicClockStatements;
    readonly syncState: SyncStateStatements;
    readonly conflict: ConflictsStatements;
    readonly syncActivity: SyncActivityStatements;
    readonly cursor: SyncCursorStatements

    //BillingSystems
    readonly entitlements: BillingEntitlementStatement;
    readonly invoices: BillingInvoiceStatement;
    readonly leases: BillingSubscriptionLeaseStatement;
    readonly override: BillingEntitlementOverrideStatement;
    readonly payments: BillingPaymentStatement;
    readonly plans: BillingPlanStatement;
    readonly planVersion: BillingPlanVersionStatement;
    readonly requests: BillingSubscriptionRequestStatement;
    readonly subscriptions: BillingSubscriptionStatement;
    constructor(
        manager: PreparedStatementManager
    ){
        this.events =
            new EventStatements(manager);

        this.inventory =
            new InventoryStatements(manager);
        
        this.products = 
            new ProductStatements(manager);
        
        this.sales =  
            new SalesStatement(manager)

        this.refund =
            new RefundStatement(manager)

        this.ledger = 
            new LedgerStatements(manager)

        this.business = 
            new BusinessStatements(manager);
        
        this.branches =
            new BranchStatements(manager);
            
        this.dashboard  = 
            new DashboardStatements(manager);

        this.businessDashboard = 
            new BusinessDashboardStatements(manager);
        this.report = 
            new ReportStatements(manager);

        this.expenses = 
            new ExpenseStatement(manager);

        this.outbox = 
            new OutboxStatments(manager)

        this.aggregates = 
            new AggregateStatements(manager)

        this.logicClock = 
            new LogicClockStatements(manager)

        this.syncState = 
            new SyncStateStatements(manager)

        this.conflict = 
            new ConflictsStatements(manager)

        this.syncActivity =  
            new SyncActivityStatements(manager)

        this.employees = 
            new EmployeeStatements(manager)

        this.eventInbox = 
            new EventInboxStatements(manager)

        this.cursor = 
            new SyncCursorStatements(manager)

        // Billing Systems
        this.entitlements = 
            new BillingEntitlementStatement(manager);

        this.invoices = 
            new BillingInvoiceStatement(manager);

        this.leases = 
            new BillingSubscriptionLeaseStatement(manager);

        this.override = 
            new BillingEntitlementOverrideStatement(manager);
        
        this.payments = 
            new BillingPaymentStatement(manager);

        this.plans = 
             new BillingPlanStatement(manager);
            
        this.planVersion = 
            new BillingPlanVersionStatement(manager);

        this.requests = 
            new BillingSubscriptionRequestStatement(manager);

        this.subscriptions = 
            new BillingSubscriptionStatement(manager)
    }
}