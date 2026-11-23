
import { BusinessStatementRegistry } from "../statements/StatementRegistry";
import { SQLiteEventRepository } from "./SQLiteEventRepository/eventStore";
import { SQLiteLedgerRepository } from "./SQLiteLedgerRepository/SQLiteLedgerRepository";
import { SQLiteBranchRepository } from "./SQLiteProjectionRepository/SQLiteBranchRepository";
import { SQLiteBusinessRepository } from "./SQLiteProjectionRepository/SQLiteBusinessRepository";
import { LogicClockRepository } from "./LogicClockRepository/LogicClockRepository";
import { SQLiteProductRepository } from "./SQLiteProjectionRepository/SQLiteProductRepository";
import { SQLiteInventoryRepository } from "./SQLiteProjectionRepository/SQLiteInventoryRepository";
import { SQLiteSalesRepository } from "./SQLiteProjectionRepository/SQLiteSalesRepository";
import { SQLiteDashboardRepository } from "./DashboardRepository/DashboardRepository";
import { SQLiteReportRepository } from "./ReportRepository/ReportRepository";
import { SQLiteOutboxRepository } from "./SQLiteOutboxRepository/SQLiteOutboxRepository";
import { SQLiteAggregateRepository } from "./SQLiteAggregateRepository/SQLiteAggregateRepository";
import { SQLiteSyncStateRepository } from "./SQLiteSyncRepository/SQLiteSyncRepository";
import { QueryRunner } from "../../../../storage/queryRunner/QueryRunner";
import { SQLiteExpenseRepository } from "./SQLiteProjectionRepository/SQLiteExpenseRepository";
import { SQLiteSyncActivityRepository } from "./SQLiteSyncRepository/SQLiteActivityRepository";
import { SQLiteConflictRepository } from "./SQLiteSyncRepository/SQLiteConflictRepository";
import { TransactionManager } from "../../../../storage/transaction/TransactionManager"; 
import { SQLiteEmployeeInvitationRepository } from "./EmployeeRepositories/SQLiteEmployeeInvitationRepository";
import { SQLiteEmployeeRepository } from "./EmployeeRepositories/SQLiteEmployeeRepository";
import { SQLiteEventInboxRepository } from "./EventInboxRepository/SQLiteEventInboxRepository";
import { SQLiteSyncCursorRepository } from "./Cursor/CursorRepository";
import { SQLiteBusinessDashboardRepository } from "./DashboardRepository/BusinessDashbaordRepositories";
import { SQLiteRefundRepository } from "./SQLiteProjectionRepository/SQLiteRefundRepository";
import { SQLiteBillingEntitlementOverrideRepository } from "./SQLiteBillings/SQLiteBillingEntitlementOverrideRepository";
import { SQLiteBillingEntitlementRepository } from "./SQLiteBillings/SQLiteBillingEntitlementRepository";
import { SQLiteBillingInvoiceRepository } from "./SQLiteBillings/SQLiteBillingInvoiceRepository";
import { SQLiteBillingPaymentRepository } from "./SQLiteBillings/SQLiteBillingPaymentRepository";
import { SQLiteBillingSubscriptionRepository } from "./SQLiteBillings/SQLiteBillingSubscriptionRepository";
import { SQLiteBillingSubscriptionLeaseRepository } from "./SQLiteBillings/SQLiteBillingSubscriptionLeaseRepository";
import { SQLiteBillingSubscriptionRequestRepository } from "./SQLiteBillings/SQLiteBillingSubscriptionRequestRepository";
import { SQLiteBillingPlanRepository } from "./SQLiteBillings/SQLitePlanRepository";
import { SQLiteBillingPlanVersionRepository } from "./SQLiteBillings/SQLitePlanVersion";

export class BusinessRepositoryRegistry {
    readonly events: SQLiteEventRepository;


    readonly ledger: SQLiteLedgerRepository;

    readonly business: SQLiteBusinessRepository;

    readonly branches: SQLiteBranchRepository;

    readonly products: SQLiteProductRepository;

    readonly inventory: SQLiteInventoryRepository;

    readonly sales: SQLiteSalesRepository;

    readonly refund: SQLiteRefundRepository;

    readonly expenses: SQLiteExpenseRepository;

    readonly employeeInvitation: SQLiteEmployeeInvitationRepository;

    readonly employee: SQLiteEmployeeRepository;

    readonly dashboard: SQLiteDashboardRepository;

    readonly businessDashboard: SQLiteBusinessDashboardRepository;
    
    readonly report: SQLiteReportRepository;

    readonly outbox: SQLiteOutboxRepository;

    readonly aggregates: SQLiteAggregateRepository;

    readonly logicClock: LogicClockRepository;

    readonly syncActivity: SQLiteSyncActivityRepository;

    readonly conflict: SQLiteConflictRepository;

    readonly syncState: SQLiteSyncStateRepository;

    readonly cursor: SQLiteSyncCursorRepository;

    //Billing Systems
    readonly entitlementOverrides: SQLiteBillingEntitlementOverrideRepository;
    readonly entitlement: SQLiteBillingEntitlementRepository;
    readonly billingInvoice: SQLiteBillingInvoiceRepository;
    readonly billingPayments: SQLiteBillingPaymentRepository;
    readonly billingSubscription: SQLiteBillingSubscriptionRepository;
    readonly billinglease: SQLiteBillingSubscriptionLeaseRepository;
    readonly billingRequest: SQLiteBillingSubscriptionRequestRepository;
    readonly billingPlans: SQLiteBillingPlanRepository;
    readonly billingPlanVersion: SQLiteBillingPlanVersionRepository

    readonly eventInbox: SQLiteEventInboxRepository
    readonly queryRunner: QueryRunner;
    readonly transaction: TransactionManager
    
    constructor(
        statements: BusinessStatementRegistry,
        queryRunner: QueryRunner,
        transaction: TransactionManager
    ){
        this.events =
            new SQLiteEventRepository(
                statements.events
            )

        this.business = 
            new SQLiteBusinessRepository(
                statements.business
            );

        this.branches = 
            new SQLiteBranchRepository(
                statements.branches
            )

        this.products = 
            new SQLiteProductRepository(
                statements.products
            )

        this.inventory = 
            new SQLiteInventoryRepository(
                statements.inventory
            )

        this.sales = 
            new SQLiteSalesRepository(
                statements.sales
            )
        this.refund = 
            new SQLiteRefundRepository(
                statements.refund
            )

        this.expenses = 
            new SQLiteExpenseRepository(
                statements.expenses
            )

        this.employeeInvitation = 
            new SQLiteEmployeeInvitationRepository(
                statements.employees
            )

        this.employee = 
            new SQLiteEmployeeRepository(
                statements.employees
            )

        this.ledger = 
            new SQLiteLedgerRepository(
                statements.ledger
            )

        this.dashboard = 
            new SQLiteDashboardRepository(
                statements.dashboard
            )

        this.businessDashboard = 
            new SQLiteBusinessDashboardRepository(
                statements.businessDashboard
            )

        this.report = 
            new SQLiteReportRepository(
                statements.report
            )
        this.outbox = 
            new SQLiteOutboxRepository(
                statements.outbox,
                queryRunner
            )
        this.aggregates = 
            new SQLiteAggregateRepository(
                statements.aggregates
            )
        this.logicClock = 
            new LogicClockRepository(
                statements.logicClock
            )

        this.syncActivity = 
            new SQLiteSyncActivityRepository(
                statements.syncActivity
            )

        this.cursor =
            new SQLiteSyncCursorRepository(
                statements.cursor
            )

        this.conflict = 
             new SQLiteConflictRepository(
                statements.conflict
             )
        this.syncState = 
             new SQLiteSyncStateRepository(
                statements.syncState,
                this.syncActivity,
                this.conflict,
                this.outbox,
                transaction

             )
        //Billing Systems
        this.entitlementOverrides = new SQLiteBillingEntitlementOverrideRepository(statements.override);
        this.entitlement = new SQLiteBillingEntitlementRepository(statements.entitlements);
        this.billingInvoice  = new SQLiteBillingInvoiceRepository(statements.invoices);
        this.billingPayments = new SQLiteBillingPaymentRepository(statements.payments);
        this.billingSubscription = new SQLiteBillingSubscriptionRepository(statements.subscriptions);
        this.billinglease = new  SQLiteBillingSubscriptionLeaseRepository(statements.leases);
        this.billingRequest = new SQLiteBillingSubscriptionRequestRepository(statements.requests);
        this.billingPlans = new SQLiteBillingPlanRepository(statements.plans);
        this.billingPlanVersion = new SQLiteBillingPlanVersionRepository(statements.planVersion)
        this.eventInbox = new SQLiteEventInboxRepository(statements.eventInbox);
        
        this.transaction = transaction;

        this.queryRunner = queryRunner
        
    }
}