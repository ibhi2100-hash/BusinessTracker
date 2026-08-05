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

    expectedAggregateVersion INTEGER NOT NULL,

    type TEXT NOT NULL,

    payload TEXT NOT NULL,

    businessId TEXT NOT NULL,

    branchId TEXT,

    mode TEXT NOT NULL,

    actor   TEXT,

    causationId TEXT,

    logicClock   INTEGER NOT NULL,

    createdAt   INTEGER NOT NULL,

    checksum TEXT
);

CREATE INDEX IF NOT EXISTS idx_event_aggregate
ON events(aggregateType, aggregateId);


`
        )
    },
} 