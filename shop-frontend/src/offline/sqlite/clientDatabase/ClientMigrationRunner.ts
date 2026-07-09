import { migrations } from "./migrations";
import { ClientConnection } from "./ClientConnection";
import { IConnectionManager } from "../types/IStorageContext";
import { QueryExecutor } from "../queryExecutor/QueryExecutor";


export class ClientMigrationRunner {
    constructor(
        private readonly queryExecutor: QueryExecutor
    ){}

    async run() {
    
        await this.queryExecutor.execute(`
            CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL
            )
        `);

        const result = await this.queryExecutor.query<{
            version: number}>(`
            SELECT MAX(version) as version
            FROM schema_version
            `);

        const currentVersion = 
            result?.[0]?.version ?? 0;

        for(
            let i =currentVersion;
            i < migrations.length;
            i++
        ){
            const version = i + 1;

            console.log(
                `[Migrationg] Running ${version}`
            );

            await this.queryExecutor.execute(migrations[i]);

            await this.queryExecutor.execute(
        `
        INSERT INTO schema_version
        (
          version,
          applied_at
        )
        VALUES (?, ?)
      `,
        [
          version,
          new Date().toISOString(),
        ]
      );
        }
    }

}