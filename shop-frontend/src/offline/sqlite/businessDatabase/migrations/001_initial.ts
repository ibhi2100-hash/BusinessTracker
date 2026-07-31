import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration001: Migration = {
    version: 1,
    name: "Necessary tables for Business",

    async up(q){
        await q.execute(
            `
-- Schema Version

CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    appliedAt TEXT NOT NULL
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
`
        )
    }
}