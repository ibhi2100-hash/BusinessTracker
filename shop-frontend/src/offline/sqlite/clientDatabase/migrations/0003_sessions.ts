import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
export const migration0003: Migration = {

    version: 3,

    name: "create session",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS sessions (

                        id TEXT PRIMARY KEY,

                        accessToken TEXT,

                        refreshToken TEXT,

                        expiresAt INTEGER,

                        userId TEXT,

                        createdAt INTEGER NOT NULL

                    );
                `,
            },

        ];
    },
};