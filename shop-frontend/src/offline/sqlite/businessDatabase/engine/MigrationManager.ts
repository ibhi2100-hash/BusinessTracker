import { StorageContext } from "./StorageContext";
import { QueryExecutor } from "./QueryExecutor";
import { migrations } from "../migrations";

export class MigrationManager {

    constructor(
        private readonly context: StorageContext,
        private readonly query: QueryExecutor
    ) {}
    async initialize() {

    await this.query.execute(`

        CREATE TABLE IF NOT EXISTS __meta(

            key TEXT PRIMARY KEY,

            value TEXT NOT NULL

        );

    `);

}   
    async currentVersion() {

    const rows =
        await this.query.query<{

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

    await this.query.execute(

        `
        INSERT INTO __meta(
            key,
            value
        )
        VALUES(
            'schemaVersion',
            ?
        )

        ON CONFLICT(key)

        DO UPDATE

        SET value=excluded.value
        `,

        [
            String(version)
        ]

    );

}
  async migrate() {

    await this.initialize();

    const current =
        await this.currentVersion();

    for(

        let i=current;

        i<migrations.length;

        i++

    ){

        console.log(
            `Running migration ${i+1}`
        );

        await this.query.execute(
            migrations[i]
        );

        await this.setVersion(
            i+1
        );

    }

}  

    async verify() {

    const rows =
        await this.query.query<{

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