import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration005 : Migration  = {
    version: 5,
    name: "Conflict",

    async up(q){
        await q.execute(
            `
CREATE TABLE IF NOT EXISTS conflicts (

    id TEXT PRIMARY KEY,

    aggregateId TEXT NOT NULL,

    aggregateType TEXT NOT NULL,

    localVersion INTEGER NOT NULL,

    serverVersion INTEGER NOT NULL,

    resolution TEXT,

    payload TEXT,

    createdAt TEXT NOT NULL,

    resolvedAt TEXT
);
`
        )
    }
} 