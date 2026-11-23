import type { Migration } from "../../clientDatabase/migrations/migrationContracts";
import type { SQLiteMigrationOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export const migration026: Migration = {
  version: 26,
  name: "Sales Refunds",

  up(): readonly SQLiteMigrationOperation[] {
    return [
      {
        sql: `
          CREATE TABLE IF NOT EXISTS refunds (
            id TEXT PRIMARY KEY NOT NULL,
            businessId TEXT NOT NULL,
            branchId TEXT NOT NULL,
            originalSaleId TEXT NOT NULL,
            refundNumber TEXT NOT NULL,
            customerId TEXT,
            customerRef TEXT,
            reason TEXT,
            status TEXT NOT NULL,
            refundMethod TEXT,
            subtotal REAL NOT NULL DEFAULT 0,
            taxAmount REAL NOT NULL DEFAULT 0,
            totalAmount REAL NOT NULL DEFAULT 0,
            userId TEXT,
            approvedBy TEXT,
            mode TEXT NOT NULL DEFAULT 'LIVE',
            createdAt INTEGER NOT NULL,
            completedAt INTEGER,
            updatedAt INTEGER
          );
        `,
      },
      {
        sql: `
          CREATE TABLE IF NOT EXISTS refund_items (
            id TEXT PRIMARY KEY NOT NULL,
            refundId TEXT NOT NULL,
            businessId TEXT NOT NULL,
            branchId TEXT NOT NULL,
            originalSaleId TEXT NOT NULL,
            saleItemId TEXT,
            productId TEXT NOT NULL,
            productName TEXT,
            quantity REAL NOT NULL DEFAULT 0,
            unitPrice REAL NOT NULL DEFAULT 0,
            unitCostPrice REAL NOT NULL DEFAULT 0,
            lineRefundAmount REAL NOT NULL DEFAULT 0,
            lineCostAmount REAL NOT NULL DEFAULT 0,
            inventoryDisposition TEXT NOT NULL DEFAULT 'NO_RESTOCK',
            createdAt INTEGER NOT NULL,
            FOREIGN KEY(refundId) REFERENCES refunds(id)
          );
        `,
      },
      {
        sql: `
          CREATE TABLE IF NOT EXISTS refund_payments (
            id TEXT PRIMARY KEY NOT NULL,
            refundId TEXT NOT NULL,
            businessId TEXT NOT NULL,
            branchId TEXT NOT NULL,
            paymentMethod TEXT NOT NULL,
            amount REAL NOT NULL DEFAULT 0,
            status TEXT NOT NULL,
            reference TEXT,
            createdAt INTEGER NOT NULL,
            completedAt INTEGER,
            FOREIGN KEY(refundId) REFERENCES refunds(id)
          );
        `,
      },
      { sql: `CREATE INDEX IF NOT EXISTS idx_refunds_business_created ON refunds(businessId, createdAt);` },
      { sql: `CREATE INDEX IF NOT EXISTS idx_refunds_branch_created ON refunds(branchId, createdAt);` },
      { sql: `CREATE INDEX IF NOT EXISTS idx_refunds_original_sale ON refunds(originalSaleId);` },
      { sql: `CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);` },
      { sql: `CREATE INDEX IF NOT EXISTS idx_refund_items_refund ON refund_items(refundId);` },
      { sql: `CREATE INDEX IF NOT EXISTS idx_refund_items_sale_item ON refund_items(saleItemId);` },
      { sql: `CREATE INDEX IF NOT EXISTS idx_refund_items_product ON refund_items(productId);` },
      { sql: `CREATE INDEX IF NOT EXISTS idx_refund_payments_refund ON refund_payments(refundId);` },
    ];
  },
};
