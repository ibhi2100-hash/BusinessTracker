
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
import { SyncStateRepository } from "../sync/syncEngine";
import { SQLiteSyncStateRepository } from "./SQLiteSyncRepository/SQLiteSyncRepository";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";


export class BusinessRepositoryRegistry {
    readonly events: SQLiteEventRepository;


    readonly ledger: SQLiteLedgerRepository;

    readonly business: SQLiteBusinessRepository;

    readonly branches: SQLiteBranchRepository;

    readonly products: SQLiteProductRepository;

    readonly inventory: SQLiteInventoryRepository;

    readonly sales: SQLiteSalesRepository;

    readonly dashboard: SQLiteDashboardRepository;

    readonly report: SQLiteReportRepository;

    readonly outbox: SQLiteOutboxRepository;

    readonly aggregates: SQLiteAggregateRepository;

    readonly logicClock: LogicClockRepository;

    readonly syncState: SQLiteSyncStateRepository


    constructor(
        statements: BusinessStatementRegistry,
        private readonly queryRunner: QueryRunner
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

        this.syncState = 
            new SQLiteSyncStateRepository(
                statements.syncState
            )
    }
}