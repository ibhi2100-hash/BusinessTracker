import { Migration } from "./migrationContracts";

export const migration0009: Migration =  {
    version: 9,
    name: "Applicaton State",
    async up(q){
        await q.execute(
            `CREATE TABLE IF NOT EXISTS application_state(
                id  INTEGER PRIMARY KEY CHECK(id = 1),

                currentBusinessId   TEXT,
                
                currentUserId   TEXT,

                currentBranchId   TEXT,

                currentWorkspaceId   TEXT,

                currentSessionId    TEXT,

                lastRoute           TEXT,

                currentWorkspaceVersion INTEGER,

                initializedAt   INTEGER
            )
            `
        )

        await q.execute(
                `
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
                strftime('%s','now')
            )
            ON CONFLICT(id) DO NOTHING;
                            
            `)
    }
}