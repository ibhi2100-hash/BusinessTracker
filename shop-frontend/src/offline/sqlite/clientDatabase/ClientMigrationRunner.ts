import { TransactionManager } from "@/src/storage/transaction/TransactionManager";
import { migrations } from "./migrations";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";


export class ClientMigrationRunner {
    constructor(
        private readonly queryRunner:QueryRunner,
        private readonly transactionManager: TransactionManager
    ){}

    async run() {
        
        await this.queryRunner.execute(`
            CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL
            )
        `);

        const result = await this.queryRunner.query<{
            version: number}>(`
            SELECT MAX(version) as version
            FROM schema_version
            `);

        const currentVersion = 
            result?.[0]?.version ?? 0;

       await this.transactionManager.run(async () => {
         for (const migration of migrations) {
            if(migration.version <= currentVersion){
                continue
            }
            try {
                console.log("migration Runing: ", {
                    migrationName: migration.name,
                    migrationVersion: migration.version
                })
                await migration.up(this.queryRunner);
                await this.queryRunner.execute(
                    `
                    INSERT INTO schema_version (
                        version,
                        applied_at
                    )
                    VALUES (
                    ${migration.version},
                    '${new Date().toISOString()}'
                    )
                    `,
        
                );

            } catch (error) {
                console.error(`Migration ${migration.version} failed.`);
                console.error(error);

                // Print the exact SQL again
                console.error("SQL:");
                console.error(migration);

                throw error;
            }
        }
       
       })     
    }

}