import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration004: Migration = {
    version: 4,

    name: "AggregateVersion",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS aggregates (
                        id TEXT PRIMARY KEY,

                        aggregateId TEXT NOT NULL,

                        aggregateType TEXT NOT NULL,

                        localVersion INTEGER NOT NULL,

                        version INTEGER NOT NULL,

                        lastEventId TEXT,

                        lastGlobalPosition INTEGER,

                        lastSnapshotVersion INTEGER,

                        isDeleted INTEGER DEFAULT 0,

                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE UNIQUE INDEX IF NOT EXISTS idx_aggregate_identity
                    ON aggregates(
                        aggregateType,
                        aggregateId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_aggregate_version
                    ON aggregates(version);
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_aggregate_updated
                    ON aggregates(updatedAt);
                `,
            },
        ];
    },
};