
import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export const migration022: Migration = {
    version: 22,
    name: "Event Inbox",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS event_inbox (
                        eventId TEXT PRIMARY KEY NOT NULL,

                        businessId TEXT NOT NULL,
                        branchId TEXT,

                        aggregateId TEXT NOT NULL,
                        aggregateType TEXT NOT NULL,
                        aggregateVersion INTEGER NOT NULL,

                        type TEXT NOT NULL,
                        payload TEXT NOT NULL,
                        mode TEXT NOT NULL,

                        userId TEXT NOT NULL,
                        deviceId TEXT NOT NULL,

                        causationId TEXT,
                        correlationId TEXT,

                        globalPosition INTEGER NOT NULL,
                        logicClock INTEGER NOT NULL,

                        checksum TEXT,
                        createdAt INTEGER NOT NULL,

                        receivedAt INTEGER NOT NULL,

                        attempts INTEGER NOT NULL DEFAULT 0,
                        lastError TEXT
                    );
                `
            },
            {
                sql: `
                    CREATE INDEX IF NOT EXISTS
                    idx_event_inbox_global_position
                    ON event_inbox(globalPosition);
                `
            }
        ];
    }
};
