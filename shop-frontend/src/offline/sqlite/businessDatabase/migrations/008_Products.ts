import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration008: Migration = {
    version: 8,

    name: "Products",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS products (
                        id TEXT PRIMARY KEY,

                        businessId TEXT,

                        branchId TEXT,

                        name TEXT NOT NULL,

                        imageUrl TEXT,

                        description TEXT,

                        costPrice INTEGER DEFAULT 0,

                        price INTEGER DEFAULT 0,

                        category TEXT,

                        reorderLevel INTEGER DEFAULT 0,

                        isActive INTEGER DEFAULT 0,

                        isDeleted INTEGER DEFAULT 0,

                        createdAt INTEGER NOT NULL,

                        updatedAt INTEGER,

                        deletedAt INTEGER
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_product_business_branch
                    ON products(businessId, branchId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_product_created
                    ON products(createdAt);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_product_branch
                    ON products(branchId);
                `,
            },
        ];
    },
};