import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration002: Migration = {
    version: 2,
    name: "Events",

    async up(q) {
        await q.execute(
             `
CREATE TABLE IF NOT EXISTS events (

    id TEXT PRIMARY KEY,

    aggregateId TEXT NOT NULL,

    aggregateType TEXT NOT NULL,

    aggregateVersion INTEGER

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

    lastRetryAt INTEGER,

    nextRetryAt INTEGER,

    lastError TEXT,

    isCreationalEvent  INTEGER DEFAULT 0,

    causationId   TEXT,

    correlationId   TEXT,

    metadata TEXT,

    checksum TEXT
);

CREATE INDEX IF NOT EXISTS idx_event_aggregate
ON events(aggregateType, aggregateId);

CREATE INDEX IF NOT EXISTS idx_event_position
ON events(globalPosition);

CREATE INDEX IF NOT EXISTS idx_event_synced
ON events(synced);

CREATE INDEX IF NOT EXISTS idx_event_created
ON events(createdAt);
`
        )
    },
} 