export const migration011 = `
CREATE TABLE IF NOT EXISTS ledger_entries (

    id TEXT PRIMARY KEY,

    userId TEXT,
    
    name TEXT NOT NULL,

    address TEXT NULL,

    createdAt TEXT NOT NULL,

    activatedAt TEXT,
    
    isOnboarding INTEGER DEFAULT 0,

    onboardingCompleted INTEGER DEFAULT 0,

    status  TEXT NOT NULL
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