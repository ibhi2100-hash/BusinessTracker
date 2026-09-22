import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration009: Migration = {
    version: 9,

    name: "Inventory",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS inventories (
                        id TEXT PRIMARY KEY,

                        productId TEXT,

                        branchId TEXT,

                        businessId TEXT,

                        quantity INTEGER DEFAULT 0,

                        costPrice INTEGER DEFAULT 0,

                        createdAt INTEGER NOT NULL,

                        updatedAt INTEGER
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_inventory_business_branch
                    ON inventories(businessId, branchId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_inventory_product_created
                    ON inventories(productId, createdAt);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_inventory_product_quantity
                    ON inventories(productId, quantity);
                `,
            },
        ];
    },
};