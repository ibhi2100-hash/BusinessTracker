// SQLiteVersionStore.ts
import { getDB } from "../../sqlite/database/db";

export class SQLiteVersionStore {

  async get(
    aggregateId: string
  ) {

    const rows =
      await getDB().query(
        `
        SELECT *
        FROM aggregate_versions
        WHERE aggregateId = ?
        LIMIT 1
        `,
        [aggregateId]
      );

    return rows[0] ?? null;
  }

  async save(
    aggregateId: string,
    version: number
  ) {

    await getDB().query(
      `
      INSERT INTO aggregate_versions (
        aggregateId,
        version
      )
      VALUES (?, ?)

      ON CONFLICT(aggregateId)
      DO UPDATE SET
        version = excluded.version
      `,
      [
        aggregateId,
        version
      ]
    );
  }
}