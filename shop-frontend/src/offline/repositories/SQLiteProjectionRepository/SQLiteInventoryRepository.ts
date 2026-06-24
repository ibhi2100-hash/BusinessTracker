// SQLiteInventoryRepository.ts

import { Inventory } from "@business/shared-types";
import { getDB } from "../database/db";
import { IProjectionEntityRepository } from "./IProjectionEntityRepository";

export class SQLiteInventoryRepository
implements IProjectionEntityRepository<Inventory> {

  async findById(id: string) {
    const db = getDB();

    const rows =
      await db.query<Inventory>(
        `
        SELECT *
        FROM inventory
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  async findAll() {
    const db = getDB();

    return db.query<Inventory>(
      `
      SELECT *
      FROM inventory
      `
    );
  }

  async upsert(
    id: string,
    state: Inventory
  ) {
    const db = getDB();

    await db.query(
      `
      INSERT INTO inventory (
        id,
        productId,
        branchId,
        quantity
      )
      VALUES (?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        quantity = excluded.quantity
      `,
      [
        id,
        state.productId,
        state.branchId,
        state.quantity
      ]
    );
  }

  async delete(id: string) {
    const db = getDB();

    await db.query(
      `
      DELETE FROM inventory
      WHERE id = ?
      `,
      [id]
    );
  }
}