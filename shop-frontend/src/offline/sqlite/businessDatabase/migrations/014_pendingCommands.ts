import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration014: Migration = {
    version: 14,

    name: "Pending Commands",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS pending_commands (
                        id TEXT PRIMARY KEY,

                        commandType TEXT NOT NULL,

                        commandMode TEXT NOT NULL,

                        payload TEXT NOT NULL,

                        aggregateId TEXT,

                        aggregateType TEXT,

                        expectedVersion INTEGER,

                        correlationId TEXT,

                        causationId TEXT,

                        status TEXT NOT NULL DEFAULT 'PENDING',

                        createdAt INTEGER NOT NULL,

                        lastAttemptAt INTEGER
                    );
                `,
            },
        ];
    },
};