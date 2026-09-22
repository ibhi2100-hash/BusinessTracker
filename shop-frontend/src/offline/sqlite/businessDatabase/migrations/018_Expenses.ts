import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration018: Migration = {
    version: 18,

    name: "Expense",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS expenses (
                        id TEXT PRIMARY KEY NOT NULL,

                        businessId TEXT NOT NULL,

                        branchId TEXT,

                        categoryId TEXT,

                        categoryName TEXT,

                        title TEXT NOT NULL,

                        description TEXT,

                        amount REAL NOT NULL DEFAULT 0,

                        paymentMethod TEXT,

                        vendorRef TEXT,

                        vendorId TEXT,

                        userId TEXT,

                        receiptRef TEXT,

                        note TEXT,

                        status TEXT NOT NULL DEFAULT 'recorded',

                        expenseGroupId TEXT,

                        mode TEXT NOT NULL DEFAULT 'LIVE',

                        incurredAt INTEGER NOT NULL,

                        createdAt INTEGER NOT NULL,

                        updatedAt INTEGER
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_expenses_branch_incurred
                    ON expenses(branchId, incurredAt);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_expenses_category
                    ON expenses(categoryId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_expenses_group
                    ON expenses(expenseGroupId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_expenses_status
                    ON expenses(status);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_expenses_business_incurred
                    ON expenses(businessId, incurredAt);
                `,
            },
        ];
    },
};