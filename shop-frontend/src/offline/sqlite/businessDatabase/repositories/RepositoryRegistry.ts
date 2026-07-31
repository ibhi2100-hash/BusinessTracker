
import { BusinessStatementRegistry } from "../statements/StatementRegistry";
import { SQLiteEventRepository } from "./SQLiteEventRepository/eventStore";
import { SQLiteLedgerRepository } from "./SQLiteLedgerRepository/SQLiteLedgerRepository";
import { SQLiteBranchRepository } from "./SQLiteProjectionRepository/SQLiteBranchRepository";
import { SQLiteBusinessRepository } from "./SQLiteProjectionRepository/SQLiteBusinessRepository";
import { SQLiteInventoryRepository } from "./SQLiteProjectionRepository/SQLiteInventoryRepository";
import { SQLiteProductRepository } from "./SQLiteProjectionRepository/SQLiteProductRepository";

export class BusinessRepositoryRegistry {
    readonly events: SQLiteEventRepository;

    readonly inventory: SQLiteInventoryRepository;

    readonly products: SQLiteProductRepository;

    readonly ledger: SQLiteLedgerRepository;

    readonly business: SQLiteBusinessRepository;

    readonly branches: SQLiteBranchRepository;

    constructor(
        statements: BusinessStatementRegistry
    ){
        this.events =
            new SQLiteEventRepository(
                statements.events
            )
        
        this.inventory =
            new SQLiteInventoryRepository(
                statements.inventory
            )
        
        this.products =
            new SQLiteProductRepository(
                statements.products
            );

        this.business = 
            new SQLiteBusinessRepository(
                statements.business
            )

        this.branches = 
            new SQLiteBranchRepository(
                statements.branches
            )

    }
}