import { IProjectionEntityRepository } from "./repositoryContract";
import { getDB } from "../../sqlite/database/db";
import { Customer } from "@business/shared-types"

export class SQLiteCustomerRepository
implements IProjectionEntityRepository<Customer> {

  async findById(id: string) {
    const db = getDB();

    const rows = await db.query<Customer>(
      `
      SELECT *
      FROM customers
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] ?? null;
  }

  async findAll() {
    return getDB().query<Customer>(
      `SELECT * FROM customers`
    );
  }

  async upsert(
    id: string,
    state: Customer
  ) {

    await getDB().query(
      `
      INSERT INTO customers (
        id,
        businessId,
        branchId,
        name,
        phone,
        balance
      )
      VALUES (?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone,
        balance = excluded.balance
      `,
      [
        id,
        state.businessId,
        state.branchId,
        state.name,
        state.phone,
        state.balance
      ]
    );
  }

  async delete(id: string) {
    await getDB().query(
      `DELETE FROM customers WHERE id = ?`,
      [id]
    );
  }
}