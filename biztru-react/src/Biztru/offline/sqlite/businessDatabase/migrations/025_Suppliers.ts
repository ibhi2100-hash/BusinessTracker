
import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export const migration025: Migration = {
  version: 25,
  name: "Supplier Management",

  up(): readonly SQLiteMigrationOperation[] {
    return [
      {
        sql: `
          CREATE TABLE IF NOT EXISTS suppliers (
            id TEXT PRIMARY KEY,
            businessId TEXT NOT NULL,
            branchId TEXT,

            supplierNumber TEXT,
            companyName TEXT NOT NULL,
            contactPerson TEXT,

            phone TEXT,
            alternatePhone TEXT,
            email TEXT,

            address TEXT,
            city TEXT,
            state TEXT,
            country TEXT DEFAULT 'Nigeria',

            supplierType TEXT NOT NULL DEFAULT 'COMPANY',
            category TEXT,

            taxIdentificationNumber TEXT,
            bankName TEXT,
            bankAccountNumber TEXT,
            bankAccountName TEXT,

            paymentTerms TEXT,
            creditLimit REAL NOT NULL DEFAULT 0,

            notes TEXT,
            status TEXT NOT NULL DEFAULT 'ACTIVE',

            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL,
            version INTEGER NOT NULL DEFAULT 1
          );
        `,
      },

      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_suppliers_business
          ON suppliers(businessId);
        `,
      },

      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_suppliers_business_branch
          ON suppliers(businessId, branchId);
        `,
      },

      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_suppliers_number
          ON suppliers(businessId, supplierNumber);
        `,
      },

      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_suppliers_company
          ON suppliers(businessId, companyName);
        `,
      },

      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_suppliers_phone
          ON suppliers(businessId, phone);
        `,
      },

      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_suppliers_email
          ON suppliers(businessId, email);
        `,
      },

      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_suppliers_status
          ON suppliers(businessId, status);
        `,
      },

      {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_suppliers_type
          ON suppliers(businessId, supplierType);
        `,
      },
    ];
  },
};
