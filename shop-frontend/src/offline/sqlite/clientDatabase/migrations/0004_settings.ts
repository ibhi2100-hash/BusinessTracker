import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
export const migration0004: Migration = {

    version: 4,

    name: "settings",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS settings (

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