import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration012: Migration = {
    version: 14,
    name: "Pending Commands",

    async up(q){
        await q.execute(
            `
            CREATE TABLE pending_commands (
                id                    TEXT PRIMARY KEY,
                commandType          TEXT NOT NULL,
                commandMode           TEXT NOT NULL,
                payload               TEXT NOT NULL,          -- original command intent
                aggregateId          TEXT,
                aggregateType        TEXT,
                expectedVersion      INTEGER,
                correlationId        TEXT,
                causationId          TEXT,
                status                TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | APPLIED | SUPERSEDED | FAILED
                createdAt            INTEGER NOT NULL,
                lastAttemptAt       INTEGER
                );

        `
        )
    }
} 