import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration010: Migration = {
    version: 10,
    name: "Ledger",

    async up(q){
        await q.execute(
            `
        CREATE TABLE IF NOT EXISTS ledger_entries (

            id TEXT PRIMARY KEY,

            eventId TEXT,
            
            businessId TEXT NOT NULL,

            branchId TEXT NULL,

            type TEXT NOT NULL,

            account TEXT NOT NULL,
            
            direction   TEXT NOT NULL,

            amount INTEGER DEFAULT 0,

            sequence   INTEGER,

            createdAt    INTEGER
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
        `
        )
    }
} 