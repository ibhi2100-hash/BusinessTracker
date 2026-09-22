import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration0006: Migration = {

    version: 6,

    name: "feature flag",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS feature_flags (

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