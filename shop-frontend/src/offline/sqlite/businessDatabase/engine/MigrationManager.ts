import type { SQLiteMigrationOperation } from "@/src/storage/statement/worker/WorkerProtocol";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { migrations } from "../migrations";

export class BusinessMigrationRunner {
    constructor(
        private readonly queryRunner: QueryRunner
    ) {}

    async initialize(): Promise<void> {
        await this.queryRunner.execute(`
            CREATE TABLE IF NOT EXISTS __meta (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);
    }

    async currentVersion(): Promise<number> {
        const rows = await this.queryRunner.query<{
            value: string;
        }>(`
            SELECT value
            FROM __meta
            WHERE key = 'schemaVersion'
        `);

        if (!rows.length) {
            return 0;
        }

        return Number(rows[0].value);
    }

    async run(): Promise<void> {
        await this.initialize();

        const current = await this.currentVersion();

        this.validateMigrationOrder();

        for (const migration of migrations) {
            if (migration.version <= current) {
                continue;
            }

            console.log("BusinessMigrationRunning:", {
                migrationName: migration.name,
                migrationVersion: migration.version,
            });

            try {
                const operations: SQLiteMigrationOperation[] = [
                    ...migration.up(),

                    {
                        sql: `
                            INSERT INTO __meta (
                                key,
                                value
                            )
                            VALUES (?, ?)

                            ON CONFLICT(key)
                            DO UPDATE SET
                                value = excluded.value;
                        `,
                        params: [
                            "schemaVersion",
                            String(migration.version),
                        ],
                    },
                ];

                await this.queryRunner.migrationTransaction(
                    operations
                );

                console.log("BusinessMigrationCompleted:", {
                    migrationName: migration.name,
                    migrationVersion: migration.version,
                });
            } catch (error) {
                console.error(
                    `Business migration ${migration.version} failed.`,
                    {
                        migrationName: migration.name,
                        error,
                        migration,
                    }
                );

                throw error;
            }
        }
    }

    async verify(): Promise<void> {
        const rows = await this.queryRunner.query<{
            integrity_check: string;
        }>(`
            PRAGMA integrity_check;
        `);

        if (rows[0]?.integrity_check !== "ok") {
            throw new Error(
                "Database integrity check failed."
            );
        }
    }

    private validateMigrationOrder(): void {
        let previousVersion = 0;

        for (const migration of migrations) {
            if (!Number.isInteger(migration.version)) {
                throw new Error(
                    `Invalid migration version for "${migration.name}": ${migration.version}`
                );
            }

            if (migration.version <= previousVersion) {
                throw new Error(
                    `Migration versions must be strictly increasing. ` +
                    `"${migration.name}" has version ${migration.version}, ` +
                    `but previous version is ${previousVersion}.`
                );
            }

            previousVersion = migration.version;
        }
    }
}