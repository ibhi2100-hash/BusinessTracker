import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration010: Migration = {
  version: 10,
  name: "Ledger",

  async up(q) {
    await q.execute(`
      CREATE TABLE IF NOT EXISTS ledger (
        id          TEXT PRIMARY KEY,
        eventId     TEXT NOT NULL,
        businessId  TEXT NOT NULL,
        branchId    TEXT NOT NULL,
        type        TEXT NOT NULL,
        account     TEXT NOT NULL,
        direction   TEXT NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
        amount      INTEGER NOT NULL DEFAULT 0,
        entryIndex     INTEGER NOT NULL,
        createdAt   INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ledger_account
        ON ledger(account);

      CREATE INDEX IF NOT EXISTS idx_ledger_business
        ON ledger(businessId);

      CREATE INDEX IF NOT EXISTS idx_ledger_branch
        ON ledger(branchId);

      CREATE INDEX IF NOT EXISTS idx_ledger_event
        ON ledger(eventId);

      CREATE INDEX IF NOT EXISTS idx_ledger_created
        ON ledger(createdAt);

      CREATE INDEX IF NOT EXISTS idx_ledger_account_created
        ON ledger(account, createdAt);

      CREATE INDEX IF NOT EXISTS idx_ledger_business_created
        ON ledger(businessId, createdAt);
    `);
  }
};