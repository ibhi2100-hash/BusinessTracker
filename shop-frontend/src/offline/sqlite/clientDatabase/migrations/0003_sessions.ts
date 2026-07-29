import { Migration } from "./migrationContracts";

export const migration0003: Migration = {
    version: 3,
    name: "create session",
    async up(q){
        await q.execute(
            `
                CREATE TABLE IF NOT EXISTS sessions (

                id TEXT PRIMARY KEY,

                accessToken  TEXT,

                refreshToken  TEXT,

                expiresAt INTEGER,

                userId  TEXT,

                createdAt INTEGER NOT NULL

            );
            `
        )
    }
} 