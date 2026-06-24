export const migration001 = `
-- Schema Version

CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
);

-- Device

CREATE TABLE IF NOT EXISTS device (
    id TEXT PRIMARY KEY,
    name TEXT,
    platform TEXT,
    app_version TEXT,
    created_at TEXT NOT NULL
);

-- Sync State

CREATE TABLE IF NOT EXISTS sync_state (
    business_id TEXT PRIMARY KEY,

    device_id TEXT NOT NULL,

    last_global_position INTEGER DEFAULT 0,

    last_snapshot_version INTEGER DEFAULT 0,

    last_snapshot_position INTEGER DEFAULT 0,

    last_sync_at TEXT,

    created_at TEXT NOT NULL,

    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_global_position
ON sync_state(last_global_position);
`;