// SQLiteProductRepository.ts

import { Product } from "@business/shared-types";
import { StorageBusCreator } from "../../sqlite/bus/StorageBusCreator";
import { DatabaseTarget } from "../../sqlite/protocol/DatabaseTarget";
import { IProjectionEntityRepository } from "./repositoryContract";

export class SQLiteProductRepository
implements IProjectionEntityRepository<Product> {

  async findById(id: string) {
 
    const storage = StorageBusCreator()
    const rows =
      await storage.query<Product>(
        DatabaseTarget.BUSINESS,
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
    const storage = StorageBusCreator()

    return storage.query<Product>(
      DatabaseTarget.BUSINESS,
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
    const storage = StorageBusCreator()

    await storage.query(
      DatabaseTarget.BUSINESS,
      `
      INSERT INTO products (
        id,
        businessId,
        branchId,
        name,
        imageUrl,
        description,
        costPrice,
        sellingPrice,
        category,
        reorderLevel,
        isActive,
        isDeleted
        createdAt,
        updatedAt,
        deletedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

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
        state.imageUrl ?? "",
        state.description ?? "",
        state.costPrice,
        state.price,
        state.category ?? "",
        state.reorderLevel,
        state.isActive,
        state.isDeleted,
        state.createdAt,
        state.updatedAt ?? "",
        state.deletedAt ?? ""
      ]
    );
  }

  async delete(id: string) {
    const storage = StorageBusCreator()

    await storage.query(
      DatabaseTarget.BUSINESS,
      `
      DELETE FROM products
      WHERE id = ?
      `,
      [id]
    );
  }
}