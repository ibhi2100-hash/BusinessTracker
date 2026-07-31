import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { QueryExecutor } from "../../queryExecutor/QueryExecutor";
import { migrations } from "../migrations";
import { TransactionManager } from "@/src/storage/transaction/TransactionManager";

export class BusinessMigrationRunner {

    constructor(
        private readonly queryRunner: QueryRunner,
        private readonly transactionManager: TransactionManager
    ) {}
    async initialize() {

    await this.queryRunner.execute(`

        CREATE TABLE IF NOT EXISTS __meta(

            key TEXT PRIMARY KEY,

            value TEXT NOT NULL

        );

    `);

}   
    async currentVersion() {

        const rows =
            await this.queryRunner.query<{

                value: string;

            }>(`

                SELECT value

                FROM __meta

                WHERE key='schemaVersion'

            `);

        if (!rows.length)
            return 0;

        return Number(rows[0].value);

    }
    private async setVersion(
        version: number
    ) {

        await this.queryRunner.execute(

            `
            INSERT INTO __meta(
                key,
                value
            )
            VALUES(
                'schemaVersion',
                '${String(version)}'
            )

            ON CONFLICT(key)

            DO UPDATE

            SET value=excluded.value
            `,

        );

    }
    async run() {

        await this.initialize();

        const current =
            await this.currentVersion();

        await this.transactionManager.run(async () => {
            for(const migration of migrations){
                if(migration.version <= current){
                    continue
                }
                try{
                    console.log("BusinessMigrationRunning:", {
                        migrantionName: migration.name,
                        migrationVersion: migration.version
                    });

                    await migration.up(this.queryRunner);
                    await this.setVersion(
                        migration.version
                    )
                }catch (error) {
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

    async verify() {

    const rows =
        await this.queryRunner.query<{

            integrity_check:string;

        }>(`

            PRAGMA integrity_check;

        `);

    if(

        rows[0].integrity_check !==

        "ok"

    ){

        throw new Error(

            "Database integrity check failed."

        );

    }

}
    
}