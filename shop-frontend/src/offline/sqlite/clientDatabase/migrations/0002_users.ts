import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
export const migration0002: Migration = {

    version: 2,

    name: "create user",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS users (

                        id TEXT PRIMARY KEY,

                        businessId TEXT,

                        branchId TEXT,

                        name TEXT NOT NULL,

                        email TEXT NOT NULL,

                        role TEXT NOT NULL,

                        onboardingCompleted INTEGER NOT NULL DEFAULT 0,

                        isActive INTEGER NOT NULL DEFAULT 1,

                        version INTEGER NOT NULL DEFAULT 0,

                        lastEventId TEXT,

                        createdAt INTEGER NOT NULL,

                        updatedAt INTEGER

                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_users_business
                    ON users(businessId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_users_branch
                    ON users(branchId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_users_business_branch
                    ON users(businessId, branchId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_users_role
                    ON users(role);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_users_active
                    ON users(isActive);
                `,
            },

        ];
    },
};