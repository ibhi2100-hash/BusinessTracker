import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration010: Migration = {
    version: 10,

    name: "Ledger",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS ledger (
                        id TEXT PRIMARY KEY,

                        eventId TEXT NOT NULL,

                        businessId TEXT NOT NULL,

                        branchId TEXT NOT NULL,

                        type TEXT NOT NULL,

                        account TEXT NOT NULL,

                        direction TEXT NOT NULL
                            CHECK (direction IN ('DEBIT', 'CREDIT')),

                        amount INTEGER NOT NULL DEFAULT 0,

                        entryIndex INTEGER NOT NULL,

                        createdAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_ledger_account
                    ON ledger(account);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_ledger_business
                    ON ledger(businessId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_ledger_branch
                    ON ledger(branchId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_ledger_event
                    ON ledger(eventId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_ledger_created
                    ON ledger(createdAt);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_ledger_account_created
                    ON ledger(account, createdAt);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_ledger_business_created
                    ON ledger(businessId, createdAt);
                `,
            },
        ];
    },
};