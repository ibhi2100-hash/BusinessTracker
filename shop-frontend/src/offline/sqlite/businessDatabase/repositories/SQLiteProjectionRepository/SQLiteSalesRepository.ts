import { IProjectionEntityRepository } from "./repositoryContract";
import { getDB } from "../../sqlite/database/db";

export class SQLiteSaleRepository
implements IProjectionEntityRepository<Sale> {

  async findById(id: string) {

    const rows =
      await getDB().query<Sale>(
        `
        SELECT *
        FROM sales
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  async findAll() {
    return getDB().query<Sale>(
      `
      SELECT *
      FROM sales
      ORDER BY createdAt DESC
      `
    );
  }

  async upsert(
    id: string,
    state: Sale
  ) {

    await getDB().query(
      `
      INSERT INTO sales (
        id,
        productId,
        quantity,
        amount,
        businessId,
        branchId,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        quantity = excluded.quantity,
        amount = excluded.amount
      `,
      [
        id,
        state.productId,
        state.quantity,
        state.amount,
        state.businessId,
        state.branchId,
        state.createdAt
      ]
    );
  }

  async delete(id: string) {
    await getDB().query(
      `
      DELETE FROM sales
      WHERE id = ?
      `,
      [id]
    );
  }
}