import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";

export const migration013: Migration = {
    version: 13,

    name: "create logicClock",

    up(): readonly SQLiteMigrationOperation[] {
        return [
            {
                sql: `
                    CREATE TABLE IF NOT EXISTS logic_clock (
                        id INTEGER PRIMARY KEY CHECK(id = 1),

                        value INTEGER NOT NULL
                    );
                `,
            },

            {
                sql: `
                    INSERT INTO logic_clock (
                        id,
                        value
                    )
                    VALUES (?, ?)
                    ON CONFLICT(id) DO NOTHING;
                `,
                params: [1, 0],
            },
        ];
    },
};