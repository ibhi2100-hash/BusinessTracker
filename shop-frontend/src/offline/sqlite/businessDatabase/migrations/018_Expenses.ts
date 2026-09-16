// migration017_Expense.ts
import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration018: Migration = {
  version: 18,
  name: "Expense",
  async up(q: any) {
    await q.execute(`
      CREATE TABLE IF NOT EXISTS expenses (
        id              TEXT PRIMARY KEY NOT NULL,
        businessId      TEXT NOT NULL,
        branchId        TEXT,
        categoryId      TEXT,
        categoryName    TEXT,
        title           TEXT NOT NULL,
        description     TEXT,
        amount          REAL NOT NULL DEFAULT 0,
        paymentMethod   TEXT,
        vendorRef       TEXT,
        vendorId        TEXT,
        userId          TEXT,
        receiptRef      TEXT,
        note            TEXT,
        status          TEXT NOT NULL DEFAULT 'recorded', -- recorded | voided | reimbursed
        expenseGroupId  TEXT,
        mode            TEXT NOT NULL DEFAULT 'LIVE',
        incurredAt      INTEGER NOT NULL,
        createdAt       INTEGER NOT NULL,
        updatedAt       INTEGER
      );

      CREATE INDEX IF NOT EXISTS idx_expenses_branch_incurred
        ON expenses (branchId, incurredAt);

      CREATE INDEX IF NOT EXISTS idx_expenses_category
        ON expenses (categoryId);

      CREATE INDEX IF NOT EXISTS idx_expenses_group
        ON expenses (expenseGroupId);

      CREATE INDEX IF NOT EXISTS idx_expenses_status
        ON expenses (status);

      CREATE INDEX IF NOT EXISTS idx_expenses_business_incurred
        ON expenses (businessId, incurredAt);
    `);
  },
};