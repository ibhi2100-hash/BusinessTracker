import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration011: Migration = {
    version: 11,

    name: "Checkpoint",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS checkpoints (
                        id TEXT PRIMARY KEY,

                        globalPosition INTEGER NOT NULL
                    );
                `,
            },
        ];
    },
};