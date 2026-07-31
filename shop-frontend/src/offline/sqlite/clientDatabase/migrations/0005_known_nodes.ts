import { Migration } from "./migrationContracts";

export const migration0005: Migration =  {
    version: 5,
    name: "known nodes",
    async up(q){
        await q.execute(
            `
                CREATE TABLE IF NOT EXISTS known_nodes(

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