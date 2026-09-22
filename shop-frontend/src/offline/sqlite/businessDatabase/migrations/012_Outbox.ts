import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration012: Migration = {
    version: 12,

    name: "Outbox",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS outbox (
                        id TEXT PRIMARY KEY,

                        eventId TEXT NOT NULL UNIQUE
                            REFERENCES events(id),

                        status TEXT NOT NULL DEFAULT 'PENDING',

                        retryCount INTEGER NOT NULL DEFAULT 0,

                        maxAttempts INTEGER NOT NULL DEFAULT 10,

                        nextRetryAt INTEGER,

                        lockedUntil INTEGER,

                        lastError TEXT,

                        createdAt INTEGER NOT NULL,

                        syncedAt INTEGER,

                        globalPosition INTEGER,

                        aggregateVersion INTEGER,

                        server_commit_time INTEGER
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_outbox_ready
                    ON outbox(status, eventId)
                    WHERE status = 'PENDING';
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_event_created
                    ON outbox(createdAt);
                `,
            },
        ];
    },
};