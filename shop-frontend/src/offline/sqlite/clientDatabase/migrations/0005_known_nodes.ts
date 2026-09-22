import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
export const migration0005: Migration = {

    version: 5,

    name: "known nodes",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS known_nodes (

                        id TEXT PRIMARY KEY,

                        name TEXT NOT NULL,

                        address TEXT,

                        createdAt INTEGER NOT NULL,

                        lastOpenedAt INTEGER,

                        existsLocally INTEGER NOT NULL DEFAULT 1,

                        icon TEXT

                    );
                `,
            },

        ];
    },
};