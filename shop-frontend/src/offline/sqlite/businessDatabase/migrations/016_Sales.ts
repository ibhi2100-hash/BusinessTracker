import { Migration } from "../../clientDatabase/migrations/migrationContracts";

export const migration016 : Migration = {
    version: 16,
    name: "Sales",
    async up(q: any) {

        await q.execute(`
            CREATE TABLE IF NOT EXISTS sales (
  id            TEXT PRIMARY KEY NOT NULL,
  businessId    TEXT,
  branchId      TEXT,
  productId     TEXT NOT NULL,
  productName   TEXT,
  quantity      INTEGER NOT NULL DEFAULT 0,
  price         REAL NOT NULL DEFAULT 0,
  costPrice     REAL NOT NULL DEFAULT 0,
  unitCostPrice     REAL NOT NULL DEFAULT 0,
  unitPrice     REAL NOT NULL DEFAULT 0,
  total         REAL NOT NULL DEFAULT 0,
  profit        REAL NOT NULL DEFAULT 0,
  paymentMethod TEXT,
  customerRef   TEXT,
  note          TEXT,
  status        TEXT NOT NULL DEFAULT 'completed', -- completed | voided | refunded
  saleGroupId   TEXT,
  mode          TEXT NOT NULL DEFAULT 'LIVE',
  createdAt     TEXT NOT NULL,
  updatedAt     TEXT
);

CREATE INDEX IF NOT EXISTS idx_sales_branch_created
  ON sales (branchId, createdAt);

CREATE INDEX IF NOT EXISTS idx_sales_product
  ON sales (productId);

CREATE INDEX IF NOT EXISTS idx_sales_group
  ON sales (saleGroupId);

CREATE INDEX IF NOT EXISTS idx_sales_status
  ON sales (status);
    `
    );

    }

}