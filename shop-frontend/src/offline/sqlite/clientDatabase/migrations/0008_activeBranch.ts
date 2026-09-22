import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
export const migration0008: Migration = {

    version: 8,

    name: "active branch",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS active_branch (

                        id TEXT PRIMARY KEY,

                        businessId TEXT NOT NULL,

                        branchId TEXT

                    );
                `,
            },

        ];
    },
};