
import { StatementRegistry } from "../statements/StatementRegistry";
import { SQLiteEventRepository } from "./SQLiteEventRepository/eventStore";
import { SQLiteBranchRepository } from "./SQLiteProjectionRepository/SQLiteBranchRepository";
import { SQLiteBusinessRepository } from "./SQLiteProjectionRepository/SQLiteBusinessRepository";
import { SQLiteInventoryRepository } from "./SQLiteProjectionRepository/SQLiteInventoryRepository";
import { SQLiteProductRepository } from "./SQLiteProjectionRepository/SQLiteProductRepository";

export class RepositoryRegistry {
    readonly events: SQLiteEventRepository;

    readonly inventory: SQLiteInventoryRepository;

    readonly products: SQLiteProductRepository;

    readonly business: SQLiteBusinessRepository;

    readonly branches: SQLiteBranchRepository;

    constructor(
        statements: StatementRegistry
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