export const migration013 = `
CREATE TABLE IF NOT EXISTS outbox (

    id TEXT PRIMARY KEY,

    aggregateId TEXT NOT NULL,

    aggregateType TEXT NOT NULL,

    version INTEGER

    expectedAggregateVersion INTEGER NOT NULL,

    type TEXT NOT NULL,

    payload TEXT NOT NULL,

    businessId TEXT NOT NULL,

    branchId TEXT,

    mode TEXT NOT NULL,

    scope   TEXT NOT NULL,

    createdAt INTEGER NOT NULL,

    updatedAt INTEGER,

    logicClock  INTEGER,

    globalPosition  INTEGER,

    deviceId TEXT,

    userId TEXT,

    syncStatus TEXT NOT NULL DEFAULT 'PENDING',

    synced INTEGER DEFAULT 0,

    syncedAt  INTEGER,

    retryCount INTEGER DEFAULT 0,

    max_retries  INTEGER DEFAULT 10,

    lastRetryAt INTEGER,

    nextRetryAt INTEGER,

    lastError TEXT,

    causationId   TEXT,

    correlationId   TEXT,

    metadata TEXT,

    checksum TEXT
);

CREATE INDEX IF NOT EXISTS idx_outbox_aggregate
ON outbox(aggregateType,aggregateId);


CREATE INDEX IF NOT EXISTS idx_event_synced
ON outbox(synced);

CREATE INDEX IF NOT EXISTS idx_event_created
ON outbox(createdAt);

CREATE INDEX IF NOT EXISTS idx_event_created
ON outbox(syncStatus);


CREATE TABLE IF NOT EXISTS outboxDeadLaterQueue (
    LIKE outbox INCLUDING ALL,
    movedAt    INTEGER
)

`;