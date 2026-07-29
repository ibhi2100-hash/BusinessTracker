// SQLiteConflictStore.ts

import { getDB } from "../../sqlite/database/db";

export class SQLiteConflictStore {

  async add(conflict: any) {

    await getDB().query(
      `
      INSERT INTO conflicts (
        id,
        aggregateId,
        conflictType,
        localVersion,
        serverVersion,
        payload,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        conflict.id,
        conflict.aggregateId,
        conflict.conflictType,
        conflict.localVersion,
        conflict.serverVersion,
        JSON.stringify(conflict.payload),
        conflict.createdAt
      ]
    );
  }

  async all() {

    return getDB().query(
      `
      SELECT *
      FROM conflicts
      ORDER BY createdAt DESC
      `
    );
  }

  async resolve(
    id: string
  ) {

    await getDB().query(
      `
      DELETE FROM conflicts
      WHERE id = ?
      `,
      [id]
    );
  }
}