import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration012: Migration = {
    version: 12,
    name: "Outbox",

    async up(q){
        await q.execute(
            `
            CREATE TABLE IF NOT EXISTS outbox (
        
            id TEXT PRIMARY KEY,

            eventId              TEXT NOT NULL UNIQUE REFERENCES events(id),
            status                TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING | IN_FLIGHT | SYNCED | CONFLICT | REJECTED
            retryCount         INTEGER NOT NULL DEFAULT 0,
            maxAttempts          INTEGER NOT NULL DEFAULT 10,
            nextRetryAt         INTEGER,
            lockedUntil          INTEGER,
            lastError            TEXT,
            createdAt            INTEGER NOT NULL,
            syncedAt             INTEGER,

            -- Server-assigned values (filled on successful ack)
            globalPosition INTEGER,
            aggregateVersion INTEGER,
            server_commit_time    INTEGER
                );


        CREATE INDEX idx_outbox_ready ON outbox(status, eventId) WHERE status = 'PENDING';

        CREATE INDEX IF NOT EXISTS idx_event_created
        ON outbox(createdAt);

        `
        )
    }
} 