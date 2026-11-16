
import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export const migration024: Migration = {
    version: 24,
    name: "Customer Management",

    up(): readonly SQLiteMigrationOperation[] {
        return [

            // =========================================================
            // CUSTOMERS
            // =========================================================

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS customers (

                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        branchId TEXT,

                        customerNumber TEXT,

                        fullName TEXT NOT NULL,

                        phone TEXT,

                        alternatePhone TEXT,

                        email TEXT,

                        address TEXT,

                        city TEXT,

                        state TEXT,

                        country TEXT DEFAULT 'Nigeria',

                        customerType TEXT NOT NULL DEFAULT 'INDIVIDUAL',

                        category TEXT,

                        dateOfBirth INTEGER,

                        gender TEXT,

                        notes TEXT,

                        status TEXT NOT NULL DEFAULT 'ACTIVE',

                        createdAt INTEGER NOT NULL,

                        updatedAt INTEGER NOT NULL,

                        version INTEGER NOT NULL DEFAULT 1
                    );
                `,
            },

            // =========================================================
            // BUSINESS INDEX
            // =========================================================

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_customers_business

                    ON customers(businessId);
                `,
            },

            // =========================================================
            // BUSINESS + BRANCH INDEX
            // =========================================================

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_customers_business_branch

                    ON customers(businessId, branchId);
                `,
            },

            // =========================================================
            // CUSTOMER NUMBER
            // =========================================================

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_customers_number

                    ON customers(businessId, customerNumber);
                `,
            },

            // =========================================================
            // PHONE LOOKUP
            // =========================================================

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_customers_phone

                    ON customers(businessId, phone);
                `,
            },

            // =========================================================
            // EMAIL LOOKUP
            // =========================================================

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_customers_email

                    ON customers(businessId, email);
                `,
            },

            // =========================================================
            // CUSTOMER STATUS
            // =========================================================

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_customers_status

                    ON customers(businessId, status);
                `,
            },

            // =========================================================
            // CUSTOMER TYPE
            // =========================================================

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_customers_type

                    ON customers(businessId, customerType);
                `,
            },

        ];
    },
};
