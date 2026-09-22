import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
export const migration0007: Migration = {

    version: 7,

    name: "sync meta",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS sync_metadata (

                        id TEXT PRIMARY KEY,

                        createdAt INTEGER NOT NULL,

                        appVersion TEXT,

                        platform TEXT

                    );
                `,
            },

        ];
    },
};