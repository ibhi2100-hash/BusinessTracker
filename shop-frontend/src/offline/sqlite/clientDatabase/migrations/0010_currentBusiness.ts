import { Migration } from "./migrationContracts";

export const migration0010: Migration =  {
    version: 10,
    name: "Current Node",
    async up(q){
        await q.execute(
            `
                CREATE TABLE IF NOT EXISTS current_nodes(

                id TEXT PRIMARY KEY,

                name TEXT NOT NULL,

                address TEXT,

                createdAt INTEGER NOT NULL,

                lastOpenedAt INTEGER,

                icon TEXT

            );
            `
        )
    }
}