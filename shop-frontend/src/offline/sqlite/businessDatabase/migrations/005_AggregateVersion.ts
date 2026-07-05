export const migration005 = `
    CREATE TABLE IF NOT EXISTS aggregates (

    id TEXT PRIMARY KEY,

    aggregateId TEXT NOT NULL,

    aggregateType TEXT NOT NULL,

    version INTEGER NOT NULL,

    lastEventId TEXT,

    lastGlobalPosition INTEGER,

    lastSnapshotVersion INTEGER,

    isDeleted INTEGER DEFAULT 0,

    updatedAt INTEGER NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_aggregate_identity
    ON aggregates(
    aggregateType,
    aggregateId
    );

    CREATE INDEX IF NOT EXISTS idx_aggregate_version
    ON aggregates(version);

    CREATE INDEX IF NOT EXISTS idx_aggregate_updated
    ON aggregates(updatedAt);
`