import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol"; 
export const migration0011: Migration = {

    version: 11,

    name: "Client Session",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS client_session (
                        id INTEGER PRIMARY KEY,
                        userId TEXT NOT NULL,
                        createdAt INTEGER NOT NULL,
                        lastAuthenticatedAt INTEGER NOT NULL,
                        updatedAt INTEGER NOT NULL,

                        CHECK (id = 1),

                        FOREIGN KEY (userId)
                            REFERENCES users(id)
                    );
                                    `
            },

        ];
    },
};