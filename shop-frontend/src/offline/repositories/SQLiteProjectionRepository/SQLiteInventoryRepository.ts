// SQLiteInventoryRepository.ts

import { Inventory } from "@business/shared-types";
import { StorageBusCreator } from "../../sqlite/bus/StorageBusCreator";
import { DatabaseTarget } from "../../sqlite/protocol/DatabaseTarget";
import { IProjectionEntityRepository } from "./repositoryContract";

export class SQLiteInventoryRepository
implements IProjectionEntityRepository<Inventory> {

  async findById(id: string) {
    const storage = StorageBusCreator()

    const rows =
      await storage.query<Inventory>(
        DatabaseTarget.BUSINESS,
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
    const storage = StorageBusCreator()

    return storage.query<Inventory>(
      DatabaseTarget.BUSINESS,
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
    const storage = StorageBusCreator()

    await storage.query(
      DatabaseTarget.BUSINESS,
      `
      INSERT INTO inventories (
        id,
        productId,
        branchId,
        quantity,
        costPrice,
        createdAt,
      )
      VALUES (?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        quantity = excluded.quantity
      `,
      [
        id,
        state.productId,
        state.branchId,
        state.quantity,
        state.costPrice,
        state.createdAt
      ]
    );
  }

  async delete(id: string) {
    const storage = StorageBusCreator()

    await storage.query(
      DatabaseTarget.BUSINESS,
      `
      DELETE FROM inventory
      WHERE id = ?
      `,
      [id]
    );
  }
}