import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration019: Migration = {
    version: 19,

    name: "SyncActivity",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS sync_activities (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,

                        activityId TEXT NOT NULL UNIQUE,

                        type TEXT NOT NULL,

                        status TEXT,

                        message TEXT,

                        eventId TEXT,

                        aggregateType TEXT,

                        aggregateId TEXT,

                        sequenceNumber INTEGER,

                        createdAt INTEGER NOT NULL,

                        metadata TEXT
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_sync_activities_created_at
                    ON sync_activities(createdAt DESC);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_sync_activities_type
                    ON sync_activities(type);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_sync_activities_status
                    ON sync_activities(status);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_sync_activities_event
                    ON sync_activities(eventId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_sync_activities_aggregate
                    ON sync_activities(aggregateType, aggregateId);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_sync_activities_type_created
                    ON sync_activities(type, createdAt DESC);
                `,
            },
        ];
    },
};