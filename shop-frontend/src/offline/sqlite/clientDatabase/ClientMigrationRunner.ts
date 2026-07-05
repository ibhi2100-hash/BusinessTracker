import { migrations } from "./migrations";
import { ClientConnection } from "./ClientConnection";
import { ClientStorageContext } from "./ClientStorageContext";

export class ClientMigrationRunner {
    constructor(
        private connection: ClientStorageContext
    ){}

    async run() {
        const db = this.connection.database();

        await db.query(`
            CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER PRIMARY KEY,
                applied_at TEXT NOT NULL
            )
        `);

        const result = await db.query(`
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

            await db.query(migrations[i]);

            await db.query(
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