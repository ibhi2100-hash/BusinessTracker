import type { Migration } from "./migrationContracts";
import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
export const migration0010: Migration = {

    version: 10,

    name: "Current Business",

    up(): readonly SQLiteMigrationOperation[] {

        return [

            {
                sql: `
                    CREATE TABLE IF NOT EXISTS current_business (

                        id INTEGER PRIMARY KEY CHECK(id = 1),

                        businessId TEXT,

                        businessName TEXT,

                        businessCode TEXT,

                        stage TEXT DEFAULT 'ONBOARDING',

                        status TEXT DEFAULT 'CREATED',

                        databaseVersion INTEGER DEFAULT 1,

                        schemaVersion INTEGER DEFAULT 1,

                        lastSequenceNumber INTEGER DEFAULT 0,

                        initializedAt INTEGER,

                        activatedAt INTEGER,

                        lastOpenedAt INTEGER,

                        updatedAt INTEGER

                    );
                `,
            },

            {
                sql: `
                    INSERT INTO current_business (
                        id,
                        businessId,
                        businessName,
                        businessCode,
                        stage,
                        status,
                        databaseVersion,
                        schemaVersion,
                        lastSequenceNumber,
                        initializedAt
                    )
                    VALUES (
                        1,
                        NULL,
                        NULL,
                        NULL,
                        'ONBOARDING',
                        'CREATED',
                        1,
                        1,
                        0,
                        strftime('%s', 'now')
                    )
                    ON CONFLICT(id) DO NOTHING;
                `,
            },

        ];
    },
};