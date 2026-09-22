import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
export const migration0009: Migration = {

    version: 9,

    name: "Application State",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS application_state (

                        id INTEGER PRIMARY KEY CHECK(id = 1),

                        currentBusinessId TEXT,

                        currentUserId TEXT,

                        currentBranchId TEXT,

                        currentWorkspaceId TEXT,

                        currentSessionId TEXT,

                        lastRoute TEXT,

                        currentWorkspaceVersion INTEGER,

                        initializedAt INTEGER

                    );
                `,
            },

            {
                sql: `
                    INSERT INTO application_state (
                        id,
                        currentBusinessId,
                        currentBranchId,
                        currentUserId,
                        currentSessionId,
                        currentWorkspaceVersion,
                        initializedAt
                    )
                    VALUES (
                        1,
                        NULL,
                        NULL,
                        NULL,
                        NULL,
                        1,
                        strftime('%s', 'now')
                    )
                    ON CONFLICT(id) DO NOTHING;
                `,
            },

        ];
    },
};