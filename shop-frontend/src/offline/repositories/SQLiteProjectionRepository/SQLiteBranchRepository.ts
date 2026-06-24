// SQLiteBranchRepository.ts

import { Branch } from "@business/shared-types";
import { getDB } from "../database/db";
import { IProjectionEntityRepository } from "./IProjectionEntityRepository";

export class SQLiteBranchRepository
implements IProjectionEntityRepository<Branch> {

  async findById(id: string) {
    const db = getDB();

    const rows =
      await db.query<Branch>(
        `
        SELECT *
        FROM branches
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  async findAll() {
    const db = getDB();

    return db.query<Branch>(
      `
      SELECT *
      FROM branches
      `
    );
  }

  async upsert(
    id: string,
    state: Branch
  ) {
    const db = getDB();

    await db.query(
      `
      INSERT INTO branches (
        id,
        businessId,
        name,
        phone
      )
      VALUES (?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone
      `,
      [
        id,
        state.businessId,
        state.name,
        state.phone ?? ""
      ]
    );
  }

  async delete(id: string) {
    const db = getDB();

    await db.query(
      `
      DELETE FROM branches
      WHERE id = ?
      `,
      [id]
    );
  }
}