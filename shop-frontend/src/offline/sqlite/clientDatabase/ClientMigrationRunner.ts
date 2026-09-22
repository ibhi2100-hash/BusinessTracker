import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
import {
    QueryRunner,
} from "@/src/storage/queryRunner/QueryRunner";

import {
    migrations,
} from "./migrations";


export class ClientMigrationRunner {

    constructor(
        private readonly queryRunner: QueryRunner
    ) {}


    async run(): Promise<void> {

        /**
         * ========================================================
         * 1. ENSURE MIGRATION METADATA TABLE EXISTS
         * ========================================================
         *
         * This is bootstrap infrastructure.
         *
         * It must exist before we can determine the current
         * migration version.
         */
        await this.queryRunner.execute(`
            CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL
            )
        `);


        /**
         * ========================================================
         * 2. READ CURRENT SCHEMA VERSION
         * ========================================================
         */
        const result =
            await this.queryRunner.query<{
                version: number | null;
            }>(`
                SELECT MAX(version) AS version
                FROM schema_version
            `);


        const currentVersion =
            result[0]?.version ?? 0;


        /**
         * ========================================================
         * 3. VALIDATE MIGRATION ORDER
         * ========================================================
         */
        this.validateMigrationOrder();


        /**
         * ========================================================
         * 4. RUN PENDING MIGRATIONS
         * ========================================================
         *
         * Each migration gets its OWN SQLite transaction.
         *
         * Migration:
         *
         *   BEGIN IMMEDIATE
         *
         *   migration SQL #1
         *   migration SQL #2
         *   ...
         *   INSERT schema_version
         *
         *   COMMIT
         *
         * If anything fails:
         *
         *   ROLLBACK
         */
        for (const migration of migrations) {

            if (migration.version <= currentVersion) {
                continue;
            }


            console.log(
                "[Migration] Running",
                {
                    migrationName: migration.name,
                    migrationVersion: migration.version,
                }
            );


            try {

                /**
                 * ------------------------------------------------
                 * Build complete migration transaction.
                 * ------------------------------------------------
                 */
                const operations:
                    SQLiteMigrationOperation[] = [
                        ...migration.up(),

                        {
                            sql: `
                                INSERT INTO schema_version (
                                    version,
                                    applied_at
                                )
                                VALUES (?, ?)
                            `,
                            params: [
                                migration.version,
                                new Date().toISOString(),
                            ],
                        },
                    ];


                /**
                 * ------------------------------------------------
                 * ONE worker RPC.
                 *
                 * The worker owns:
                 *
                 * BEGIN
                 * SQL
                 * schema_version INSERT
                 * COMMIT / ROLLBACK
                 * ------------------------------------------------
                 */
                await this.queryRunner.migrationTransaction(
                    operations
                );


                console.log(
                    "[Migration] Completed",
                    {
                        migrationName: migration.name,
                        migrationVersion: migration.version,
                    }
                );

            } catch (error) {

                console.error(
                    `[Migration] ${migration.version} failed.`,
                    {
                        migrationName: migration.name,
                        error,
                    }
                );

                throw error;
            }
        }
    }


    /**
     * ============================================================
     * MIGRATION ORDER VALIDATION
     * ============================================================
     */
    private validateMigrationOrder(): void {

        let previousVersion = 0;

        for (const migration of migrations) {

            if (!Number.isInteger(migration.version)) {

                throw new Error(
                    `Invalid migration version for "${migration.name}": ` +
                    `${migration.version}`
                );
            }


            if (migration.version <= previousVersion) {

                throw new Error(
                    `Migration versions must be strictly increasing. ` +
                    `"${migration.name}" has version ` +
                    `${migration.version}, ` +
                    `but previous version is ${previousVersion}.`
                );
            }


            previousVersion =
                migration.version;
        }
    }
}