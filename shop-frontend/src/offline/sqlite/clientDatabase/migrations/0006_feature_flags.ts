import { Migration } from "./migrationContracts";

export const migration0006: Migration = {
    version: 6,
    name: "feature flag",
    async up(q){
        `
            CREATE TABLE IF NOT EXISTS feature_flags(

            id TEXT PRIMARY KEY,

            createdAt INTEGER NOT NULL,

            appVersion TEXT,

            platform TEXT

        );
        `
    }
}