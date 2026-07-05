export const migration0002 = `
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

CREATE INDEX IF NOT EXISTS idx_users_business
ON users(businessId);

CREATE INDEX IF NOT EXISTS idx_users_branch
ON users(branchId);

CREATE INDEX IF NOT EXISTS idx_users_business_branch
ON users(businessId, branchId);

CREATE INDEX IF NOT EXISTS idx_users_role
ON users(role);

CREATE INDEX IF NOT EXISTS idx_users_active
ON users(isActive);
`