import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration006: Migration = {
    version: 6,

    name: "Business",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS businesses (
                        id TEXT PRIMARY KEY,

                        userId TEXT,

                        name TEXT NOT NULL,

                        address TEXT,

                        createdAt INTEGER NOT NULL,

                        activatedAt INTEGER,

                        isOnboarding INTEGER DEFAULT 0,

                        onboardingCompleted INTEGER DEFAULT 0,

                        status TEXT NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_business
                    ON businesses(userId);
                `,
            },
        ];
    },
};