import { Migration } from "./migrationContracts";

export const migration0008: Migration =  {
    version: 8,
    name: "active branch",
    async up(q){
        await q.execute(
                    `
            CREATE TABLE IF NOT EXISTS active_branch(

            id TEXT PRIMARY KEY,

            businessId TEXT NOT NULL,
            branchId    TEXT

        );
        `
        )
    }
}