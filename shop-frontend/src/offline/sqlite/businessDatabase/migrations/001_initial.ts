export const migration001 = `
-- Schema Version

CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    appliedAt TEXT NOT NULL
);

-- Device

CREATE TABLE IF NOT EXISTS device (
    id TEXT PRIMARY KEY,
    name TEXT,
    platform TEXT,
    appVersion TEXT,
    createdAt TEXT NOT NULL
);

-- Sync State

CREATE TABLE IF NOT EXISTS sync_state (
    businessId TEXT PRIMARY KEY,

    deviceId TEXT NOT NULL,

    lastGlobalPosition INTEGER DEFAULT 0,

    lastSnapshotVersion INTEGER DEFAULT 0,

    lastSnapshotPosition INTEGER DEFAULT 0,

    lastSyncAt TEXT,

    createdAt TEXT NOT NULL,

    updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_global_position
ON sync_state(lastGlobalPosition);
`;