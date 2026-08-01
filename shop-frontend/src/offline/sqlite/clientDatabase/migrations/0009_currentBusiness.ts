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

                currentSessionId    TEXT,

                currentWorkspaceVersion INTEGER,

                initializedAt   INTEGER
            )
            `
        )
    }
}