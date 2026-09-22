import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration007: Migration = {
    version: 7,

    name: "Branch",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS branches (
                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        name TEXT NOT NULL,

                        address TEXT,

                        phone TEXT,

                        isActive INTEGER DEFAULT 0,

                        createdAt INTEGER NOT NULL,

                        isDefault INTEGER DEFAULT 0
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_branch
                    ON branches(businessId);
                `,
            },
        ];
    },
};