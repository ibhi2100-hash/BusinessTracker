// SQLiteBusinessRepository.ts

import { Business } from "@business/shared-types";
import { getDB } from "../../sqlite/database/db";
import { IProjectionEntityRepository } from "./repositoryContract";

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
        userId,
        name,
        address,
        createdAt,
        activatedAt,
        isOnboarding,
        onboardingCompleted,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        name = excluded.name,
        address = excluded.address
      `,
      [
        id === state.id ?
        id : state.id,
        state.userId,
        state.name,
        state.address ?? "",
        state.createdAt,
        state.activatedAt ?? "",
        state.isOnboarding,
        state.onboardingCompleted,
        state.status
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