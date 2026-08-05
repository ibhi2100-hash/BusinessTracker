import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration015: Migration = {
    version: 15,
    name: "Event Resolution",

    async up(q){
        await q.execute(
            `
            CREATE TABLE event_resolution (
                id,               TEXT PRIMARY KEY,
                
                eventId  TEXT,

                state   TEXT,

                supersedBy   TEXT,

                resolvedAt   INTEGER
                );

        `
        )
    }
} 