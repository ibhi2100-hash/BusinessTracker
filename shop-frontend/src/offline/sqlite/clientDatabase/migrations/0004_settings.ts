import { Migration } from "./migrationContracts";

export const migration0004: Migration = {
    version: 4,
    name: "settings",
    async up(q){
        await q.execute(
            `
                CREATE TABLE IF NOT EXISTS settings (

                id TEXT PRIMARY KEY,

                createdAt INTEGER NOT NULL,

                appVersion TEXT,

                platform TEXT

            );
            `
        )

    }
}