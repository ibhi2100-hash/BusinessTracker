import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration0001: Migration = {

    version: 1,

    name: "device",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS device (
                        id TEXT PRIMARY KEY,
                        deviceId TEXT NOT NULL,
                        createdAt INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    INSERT OR IGNORE INTO device (
                        id,
                        deviceId,
                        createdAt
                    )
                    VALUES (?, ?, ?);
                `,
                params: [
                    "default",
                    crypto.randomUUID(),
                    Date.now(),
                ],
            },

        ];
    },
};