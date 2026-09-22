import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration003: Migration = {
    version: 3,

    name: "Snapshots",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS snapshots (
                        id TEXT PRIMARY KEY,

                        aggregateId TEXT NOT NULL,

                        aggregateType TEXT NOT NULL,

                        version INTEGER NOT NULL,

                        lastGlobalPosition INTEGER NOT NULL,

                        snapshotType TEXT NOT NULL,

                        state TEXT NOT NULL,

                        checksum TEXT,

                        compressed INTEGER DEFAULT 0,

                        createdAt TEXT NOT NULL
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_snapshot_aggregate
                    ON snapshots(
                        aggregateType,
                        aggregateId
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_snapshot_version
                    ON snapshots(
                        aggregateType,
                        aggregateId,
                        version
                    );
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_snapshot_created
                    ON snapshots(createdAt);
                `,
            },
        ];
    },
};