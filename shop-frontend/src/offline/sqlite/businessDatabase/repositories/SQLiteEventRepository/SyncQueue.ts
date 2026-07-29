// SQLiteSyncQueueRepository.ts

import { getDB } from "../../sqlite/database/db";

export class SQLiteSyncQueueRepository {

  async enqueue(
    eventId: string
  ) {

    await getDB().query(
      `
      INSERT INTO pending_events (
        eventId,
        status,
        retryCount,
        createdAt
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        eventId,
        "PENDING",
        0,
        Date.now()
      ]
    );
  }

  async pending() {

    return getDB().query(
      `
      SELECT *
      FROM pending_events
      WHERE status = 'PENDING'
      ORDER BY createdAt ASC
      `
    );
  }

  async markSynced(
    eventId: string
  ) {

    await getDB().query(
      `
      UPDATE pending_events
      SET status = 'SYNCED'
      WHERE eventId = ?
      `,
      [eventId]
    );
  }

  async incrementRetry(
    eventId: string
  ) {

    await getDB().query(
      `
      UPDATE pending_events
      SET retryCount = retryCount + 1
      WHERE eventId = ?
      `,
      [eventId]
    );
  }
}