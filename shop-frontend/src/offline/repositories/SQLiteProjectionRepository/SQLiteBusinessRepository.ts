// SQLiteBusinessRepository.ts

import { Business } from "@business/shared-types";
import { getDB } from "../database/db";
import { IProjectionEntityRepository } from "./IProjectionEntityRepository";

export class SQLiteBusinessRepository
  implements IProjectionEntityRepository<Business> {

  async findById(id: string) {
    const db = getDB();

    const rows =
      await db.query<Business>(
        `
        SELECT *
        FROM businesses
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  async findAll() {
    const db = getDB();

    return db.query<Business>(
      `
      SELECT *
      FROM businesses
      `
    );
  }

  async upsert(
    id: string,
    state: Business
  ) {
    const db = getDB();

    await db.query(
      `
      INSERT INTO businesses (
        id,
        name,
        address
      )
      VALUES (?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        name = excluded.name,
        address = excluded.address
      `,
      [
        id,
        state.name,
        state.address ?? ""
      ]
    );
  }

  async delete(id: string) {
    const db = getDB();

    await db.query(
      `
      DELETE FROM businesses
      WHERE id = ?
      `,
      [id]
    );
  }
}