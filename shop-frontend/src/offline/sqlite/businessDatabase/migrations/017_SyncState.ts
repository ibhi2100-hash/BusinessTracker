import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration017: Migration = {
    version: 17,

    name: "Sync",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    DROP TABLE IF EXISTS sync;
                `,
            },

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS sync (
                        stream TEXT PRIMARY KEY,

                        cursor INTEGER NOT NULL DEFAULT 0,

                        updatedAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    INSERT INTO sync (
                        stream,
                        cursor,
                        updatedAt
                    )
                    VALUES (?, ?, ?);
                `,
                params: [
                    "BUSINESS",
                    0,
                    Date.now(),
                ],
            },
        ];
    },
};