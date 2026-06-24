export const migration002 = `
CREATE TABLE IF NOT EXISTS events (

    id TEXT PRIMARY KEY,

    business_id TEXT NOT NULL,

    branch_id TEXT,

    aggregate_id TEXT NOT NULL,

    aggregate_type TEXT NOT NULL,

    aggregate_version INTEGER NOT NULL,

    global_position INTEGER,

    event_type TEXT NOT NULL,

    payload TEXT NOT NULL,

    metadata TEXT,

    device_id TEXT,

    user_id TEXT,

    created_at TEXT NOT NULL,

    synced INTEGER DEFAULT 0,

    checksum TEXT
);

CREATE INDEX IF NOT EXISTS idx_event_aggregate
ON events(aggregate_type, aggregate_id);

CREATE INDEX IF NOT EXISTS idx_event_position
ON events(global_position);

CREATE INDEX IF NOT EXISTS idx_event_synced
ON events(synced);

CREATE INDEX IF NOT EXISTS idx_event_created
ON events(created_at);
`;