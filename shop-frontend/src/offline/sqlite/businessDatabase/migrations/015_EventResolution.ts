import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration015: Migration = {
    version: 15,

    name: "Event Resolution",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS event_resolution (
                        id TEXT PRIMARY KEY,

                        eventId TEXT,

                        state TEXT,

                        supersedBy TEXT,

                        resolvedAt INTEGER
                    );
                `,
            },
        ];
    },
};