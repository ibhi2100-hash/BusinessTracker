import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration010: Migration = {
  version: 10,
  name: "Ledger",

  async up(q) {
    await q.execute(`
      CREATE TABLE IF NOT EXISTS ledger_entries (
        id          TEXT PRIMARY KEY,
        eventId     TEXT NOT NULL,
        businessId  TEXT NOT NULL,
        branchId    TEXT NOT NULL,
        type        TEXT NOT NULL,
        account     TEXT NOT NULL,
        direction   TEXT NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
        amount      INTEGER NOT NULL DEFAULT 0,
        "index"     INTEGER NOT NULL,
        createdAt   INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ledger_account
        ON ledger_entries(account);

      CREATE INDEX IF NOT EXISTS idx_ledger_business
        ON ledger_entries(businessId);

      CREATE INDEX IF NOT EXISTS idx_ledger_branch
        ON ledger_entries(branchId);

      CREATE INDEX IF NOT EXISTS idx_ledger_event
        ON ledger_entries(eventId);

      CREATE INDEX IF NOT EXISTS idx_ledger_created
        ON ledger_entries(createdAt);

      CREATE INDEX IF NOT EXISTS idx_ledger_account_created
        ON ledger_entries(account, createdAt);

      CREATE INDEX IF NOT EXISTS idx_ledger_business_created
        ON ledger_entries(businessId, createdAt);
    `);
  }
};