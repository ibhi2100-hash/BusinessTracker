// SQLiteProductRepository.ts

import { Product } from "@business/shared-types";
import { getDB } from "../database/db";
import { IProjectionEntityRepository } from "./IProjectionEntityRepository";

export class SQLiteProductRepository
implements IProjectionEntityRepository<Product> {

  async findById(id: string) {
    const db = getDB();

    const rows =
      await db.query<Product>(
        `
        SELECT *
        FROM products
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  async findAll() {
    const db = getDB();

    return db.query<Product>(
      `
      SELECT *
      FROM products
      `
    );
  }

  async upsert(
    id: string,
    state: Product
  ) {
    const db = getDB();

    await db.query(
      `
      INSERT INTO products (
        id,
        businessId,
        branchId,
        name,
        sellingPrice,
        costPrice
      )
      VALUES (?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        name = excluded.name,
        sellingPrice = excluded.sellingPrice,
        costPrice = excluded.costPrice
      `,
      [
        id,
        state.businessId,
        state.branchId,
        state.name,
        state.sellingPrice,
        state.costPrice
      ]
    );
  }

  async delete(id: string) {
    const db = getDB();

    await db.query(
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [id]
    );
  }
}