import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration0013: Migration = {
    version: 13,
    name: "create logicClock",
    async up(q){
        await q.execute(
            `
                CREATE TABLE IF NOT EXISTS logic_clock(

                id INTEGER PRIMARY KEY CHECK(id = 1),

                value INTEGER NOT NULL

            );
        `
        );
        await q.execute(`
            
            INSERT INTO logic_clock(
                            id,
                            value
                        )
                        VALUES(
                            1,
                            0
                        );
            `
        )
    }
}