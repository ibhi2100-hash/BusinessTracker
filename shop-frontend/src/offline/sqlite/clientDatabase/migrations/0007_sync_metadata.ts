import { Migration } from "./migrationContracts";

export const migration0007: Migration = {
    version: 7,
    name: "sync meta",
    async up(q){
        await q.execute(
             `
    CREATE TABLE IF NOT EXISTS sync_metadata (

    id TEXT PRIMARY KEY,

    createdAt INTEGER NOT NULL,

    appVersion TEXT,

    platform TEXT

);
`
        )
    }
}