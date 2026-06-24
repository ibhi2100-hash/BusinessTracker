export const migration004 = `
CREATE TABLE IF NOT EXISTS snapshots (

    id TEXT PRIMARY KEY,

    aggregate_id TEXT NOT NULL,

    aggregate_type TEXT NOT NULL,

    version INTEGER NOT NULL,

    last_global_position INTEGER NOT NULL,

    snapshot_type TEXT NOT NULL,

    data TEXT NOT NULL,

    checksum TEXT,

    compressed INTEGER DEFAULT 0,

    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshot_aggregate
ON snapshots(aggregate_type, aggregate_id);

CREATE INDEX IF NOT EXISTS idx_snapshot_version
ON snapshots(version);
`;