import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration001: Migration = {
    version: 1,

    name: "Necessary tables for Business",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS schema_version (
                        version INTEGER PRIMARY KEY,
                        appliedAt TEXT NOT NULL
                    );
                `,
            },

            {
                sql: `
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
                `,
            },

            {
                sql: `
                    CREATE INDEX IF NOT EXISTS idx_sync_global_position
                    ON sync_state(lastGlobalPosition);
                `,
            },
        ];
    },
};