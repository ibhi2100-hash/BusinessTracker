import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration009: Migration = {
    version: 9,
    name: "Inventory",

    async up(q){
        await q.execute(
            `
        CREATE TABLE IF NOT EXISTS inventories (

            id TEXT PRIMARY KEY,

            productId TEXT,
            
            branchId TEXT,

            businessId  TEXT,

            quantity INTEGER DEFAULT 0,

            costPrice  INTEGER DEFAULT 0,

            createdAt TEXT NOT NULL,
            updatedAt TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_inventory
        ON inventories(businessId, branchId);

        CREATE INDEX IF NOT EXISTS idx_inventory
        ON inventories(productId, createdAt);

        CREATE INDEX IF NOT EXISTS idx_inventory
        ON inventories(productId, quantity);
        `
        )
    }
} 