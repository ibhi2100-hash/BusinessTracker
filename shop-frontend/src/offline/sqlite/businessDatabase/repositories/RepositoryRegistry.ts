
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
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { SQLiteExpenseRepository } from "./SQLiteProjectionRepository/SQLiteExpenseRepository";
import { SQLiteSyncActivityRepository } from "./SQLiteSyncRepository/SQLiteActivityRepository";
import { SQLiteConflictRepository } from "./SQLiteSyncRepository/SQLiteConflictRepository";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";


export class BusinessRepositoryRegistry {
    readonly events: SQLiteEventRepository;


    readonly ledger: SQLiteLedgerRepository;

    readonly business: SQLiteBusinessRepository;

    readonly branches: SQLiteBranchRepository;

    readonly products: SQLiteProductRepository;

    readonly inventory: SQLiteInventoryRepository;

    readonly sales: SQLiteSalesRepository;

    readonly expenses: SQLiteExpenseRepository;

    readonly dashboard: SQLiteDashboardRepository;

    readonly report: SQLiteReportRepository;

    readonly outbox: SQLiteOutboxRepository;

    readonly aggregates: SQLiteAggregateRepository;

    readonly logicClock: LogicClockRepository;

    readonly syncActivity: SQLiteSyncActivityRepository;

    readonly conflict: SQLiteConflictRepository;

    readonly syncState: SQLiteSyncStateRepository;


    constructor(
        statements: BusinessStatementRegistry,
        private readonly queryRunner: QueryRunner,
        private readonly transaction: TransactionManager
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

        this.expenses = 
            new SQLiteExpenseRepository(
                statements.expenses
            )

        this.ledger = 
            new SQLiteLedgerRepository(
                statements.ledger
            )

        this.dashboard = 
            new SQLiteDashboardRepository(
                statements.dashboard
            )

        this.report = 
            new SQLiteReportRepository(
                statements.report
            )
        this.outbox = 
            new SQLiteOutboxRepository(
                statements.outbox,
                this.queryRunner
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
                this.transaction

             )
        
    }
}