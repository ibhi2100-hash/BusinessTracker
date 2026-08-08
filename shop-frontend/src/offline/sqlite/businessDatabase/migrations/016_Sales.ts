import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration016 : Migration = {
    version: 16,
    name: "Sales",
    async up(q: any) {

        await q.execute(`
            CREATE TABLE IF NOT EXISTS sales (

                id TEXT PRIMARY KEY,

                businessId TEXT,

                branchId TEXT,

                productId TEXT,

                quantity INTEGER DEFAULT 0,

                price INTEGER DEFAULT 0,

                costPrice INTEGER DEFAULT 0,

                total INTEGER DEFAULT 0,

                createdAt TEXT NOT NULL,

                updatedAt TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_sales_business_branch
            ON sales(businessId, branchId);

            CREATE INDEX IF NOT EXISTS idx_sales_product
            ON sales(productId);

            CREATE INDEX IF NOT EXISTS idx_sales_created
            ON sales(createdAt);

            CREATE INDEX IF NOT EXISTS idx_sales_product_created
            ON sales(productId, createdAt);
        `);

    }

}