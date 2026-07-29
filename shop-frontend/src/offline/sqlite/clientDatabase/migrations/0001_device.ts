import { Migration } from "./migrationContracts";

export const migration0001: Migration = {
    version: 1,
    name: "device",

    async up(q) {

        await q.execute(`
            CREATE TABLE IF NOT EXISTS device (
                id TEXT PRIMARY KEY,
                deviceId TEXT NOT NULL,
                createdAt INTEGER NOT NULL
            );
        `);

        await q.execute(`
            INSERT OR IGNORE INTO device(
                id,
                deviceId,
                createdAt
            )
            VALUES(
                'default',
                '${crypto.randomUUID()}',
                ${Date.now()}
            );
        `);
    }
}