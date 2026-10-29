import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export const migration017: Migration = {
    version: 17,
    name: "Sync Cursor",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS sync_cursor (
                        stream TEXT PRIMARY KEY NOT NULL,
                        cursor TEXT NOT NULL DEFAULT '0',
                        updatedAt INTEGER NOT NULL
                    );
                `,
            },
            {
                sql: `
                    INSERT INTO sync_cursor (
                        stream,
                        cursor,
                        updatedAt
                    )
                    VALUES (
                        'BUSINESS',
                        '0',
                        CAST(strftime('%s', 'now') AS INTEGER) * 1000
                    )
                    ON CONFLICT(stream) DO NOTHING;
                `,
            },
        ];
    },
};