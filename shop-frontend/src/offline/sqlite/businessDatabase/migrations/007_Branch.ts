import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration007: Migration = {
    version: 7,
    name: "Branch",

    async up(q){
        await q.execute(
            `
    CREATE TABLE IF NOT EXISTS branches (

        id TEXT PRIMARY KEY,
        
        businessId TEXT NOT NULL,

        name TEXT NOT NULL,

        address TEXT,

        phone TEXT,

        isActive INTEGER DEFAULT 0,

        createdAt TEXT NOT NULL,

        isDefault INTEGER DEFAULT 0

    );

    CREATE INDEX IF NOT EXISTS idx_branch
    ON branches(businessId);

    `     )
    }
}