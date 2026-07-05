export const migration007 = `
CREATE TABLE IF NOT EXISTS businesses (

    id TEXT PRIMARY KEY,

    userId TEXT,
    
    name TEXT NOT NULL,

    address TEXT,

    createdAt TEXT NOT NULL,

    activatedAt TEXT,
    
    isOnboarding INTEGER DEFAULT 0,

    onboardingCompleted INTEGER DEFAULT 0,

    status  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_business
ON businesses(userId);

`