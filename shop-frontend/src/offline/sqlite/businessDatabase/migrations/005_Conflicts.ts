import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration005: Migration = {
    version: 5,

    name: "Conflict",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS conflicts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,

                        eventId TEXT NOT NULL UNIQUE,

                        aggregateId TEXT NOT NULL,

                        aggregateType TEXT NOT NULL,

                        localVersion INTEGER NOT NULL,

                        serverVersion INTEGER NOT NULL,

                        status TEXT NOT NULL DEFAULT 'PENDING',

                        payload TEXT,

                        createdAt INTEGER NOT NULL,

                        resolvedAt INTEGER,

                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_conflicts_aggregate
                    ON conflicts(
                        aggregateType,
                        aggregateId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_conflicts_created_at
                    ON conflicts(createdAt);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_conflicts_resolved_at
                    ON conflicts(resolvedAt);
                `,
            },
        ];
    },
};