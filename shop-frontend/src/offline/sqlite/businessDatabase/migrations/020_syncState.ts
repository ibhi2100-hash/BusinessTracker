import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration020: Migration = {
    version: 20,

    name: "Sync State",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    DROP TABLE IF EXISTS sync_state;
                `,
            },

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS sync_state (
                        id INTEGER PRIMARY KEY CHECK (id = 1),

                        status TEXT NOT NULL DEFAULT 'SYNCED',

                        pendingEvents INTEGER NOT NULL DEFAULT 0,

                        uploadedEvents INTEGER NOT NULL DEFAULT 0,

                        alreadyAcceptedEvents INTEGER NOT NULL DEFAULT 0,

                        pulledEvents INTEGER NOT NULL DEFAULT 0,

                        acceptedEvents INTEGER NOT NULL DEFAULT 0,

                        rejectedEvents INTEGER NOT NULL DEFAULT 0,

                        conflictEvents INTEGER NOT NULL DEFAULT 0,

                        deviceCursor INTEGER NOT NULL DEFAULT 0,

                        lastPulledGlobalPosition INTEGER NOT NULL DEFAULT 0,

                        lastSyncAt INTEGER,

                        lastSyncDurationMs INTEGER,

                        lastResult TEXT,

                        error TEXT,

                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    INSERT INTO sync_state (
                        id,

                        status,

                        pendingEvents,
                        uploadedEvents,
                        alreadyAcceptedEvents,
                        pulledEvents,

                        acceptedEvents,
                        rejectedEvents,
                        conflictEvents,

                        deviceCursor,
                        lastPulledGlobalPosition,

                        lastSyncAt,
                        lastSyncDurationMs,

                        lastResult,

                        error,

                        updatedAt
                    )
                    VALUES (
                        ?,

                        ?,

                        ?,
                        ?,
                        ?,
                        ?,

                        ?,
                        ?,
                        ?,

                        ?,
                        ?,

                        ?,
                        ?,

                        ?,

                        ?,

                        CAST(strftime('%s', 'now') AS INTEGER) * 1000
                    )
                    ON CONFLICT(id) DO NOTHING;
                `,
                params: [
                    1,
                    "IDLE",

                    0,
                    0,
                    0,
                    0,

                    0,
                    0,
                    0,

                    0,
                    0,

                    null,
                    null,

                    null,

                    null,
                ],
            },
        ];
    },
};