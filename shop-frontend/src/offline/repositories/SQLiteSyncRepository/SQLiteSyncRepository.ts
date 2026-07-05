import {
  AggregateState,
  SyncRepository,
  SyncConflict,
  ConflictResolution
} from "@business/sync";

import { BaseEvent } from "@business/shared-types";

import { getDB } from "../../sqlite/database/db";


export class SQLiteSyncRepository
implements SyncRepository {

  async getEvent(
    eventId: string
  ): Promise<BaseEvent | null> {

    const rows =
      await getDB().query(
        `
        SELECT *
        FROM events
        WHERE id = ?
        LIMIT 1
        `,
        [eventId]
      );

    return rows[0] ?? null;
  }

  async getPendingEvents(): Promise<BaseEvent[]> {

    return getDB().query(
      `
      SELECT *
      FROM events
      WHERE syncStatus = 'PENDING'
      ORDER BY logicClock ASC
      `
    );
  }

  async getRetryableEvents(
    now: number
  ): Promise<BaseEvent[]> {

    return getDB().query(
      `
      SELECT *
      FROM events
      WHERE status = 'RETRYING'
      AND nextRetryAt <= ?
      ORDER BY nextRetryAt ASC
      `,
      [now]
    );
  }

  async getSyncedEvents(
    aggregateId: string,
    aggregateType: string
  ): Promise<BaseEvent[]> {

    return getDB().query(
      `
      SELECT *
      FROM events
      WHERE aggregateId = ?
      AND aggregateType = ?
      AND syncStatus = 'SYNCED'
      ORDER BY aggregateVersion ASC
      `,
      [
        aggregateId,
        aggregateType
      ]
    );
  }

  async getAggregateState(
    aggregateId: string,
    aggregateType: string
  ): Promise<AggregateState> {

    const rows =
      await getDB().query(
        `
        SELECT *
        FROM aggregates
        WHERE aggregateId = ?
        AND aggregateType = ?
        LIMIT 1
        `,
        [
          aggregateId,
          aggregateType
        ]
      );

    const state = rows[0];

    if (!state) {

      return {
        id: `${aggregateType}-${aggregateId}`,
        aggregateId,
        aggregateType,
        version: 0,
        lastEventId: undefined,
        lastGlobalPosition: BigInt(0),
        updatedAt: new Date()
      };
    }

    return {
      ...state,
      lastGlobalPosition:
        BigInt(
          state.lastGlobalPosition ?? 0
        )
    };
  }

  async markSyncing(
    eventId: string
  ): Promise<void> {

    await getDB().query(
      `
      UPDATE events
      SET status = 'SYNCING'
      WHERE id = ?
      `,
      [eventId]
    );
  }

  async markSyncingBatch(
    eventIds: string[]
  ): Promise<void> {

    const db = getDB();

    for (const id of eventIds) {

      await db.query(
        `
        UPDATE events
        SET status = 'SYNCING'
        WHERE id = ?
        `,
        [id]
      );
    }
  }

  async markSynced(
    eventId: string,
    aggregateVersion: number,
    globalPosition?: bigint
  ): Promise<void> {

    await getDB().query(
      `
      UPDATE events
      SET
        status = 'SYNCED',
        synced = 1,
        aggregateVersion = ?,
        globalPosition = ?,
        nextRetryAt = NULL,
        retryCount = 0,
        lastError = NULL
      WHERE id = ?
      `,
      [
        aggregateVersion,
        globalPosition
          ? Number(globalPosition)
          : null,
        eventId
      ]
    );
  }

  async markFailed(
    eventId: string,
    error: string,
    retryCount: number,
    nextRetryAt?: number
  ): Promise<void> {

    await getDB().query(
      `
      UPDATE events
      SET
        status = 'RETRYING',
        retryCount = ?,
        nextRetryAt = ?,
        lastError = ?
      WHERE id = ?
      `,
      [
        retryCount,
        nextRetryAt ?? null,
        error,
        eventId
      ]
    );
  }

  async markDead(
    eventId: string,
    error: string
  ): Promise<void> {

    await getDB().query(
      `
      UPDATE events
      SET
        status = 'FAILED',
        lastError = ?
      WHERE id = ?
      `,
      [
        error,
        eventId
      ]
    );
  }

  async resetForRetry(
    eventId: string
  ): Promise<void> {

    await getDB().query(
      `
      UPDATE events
      SET
        status = 'PENDING',
        nextRetryAt = NULL,
        lastError = NULL
      WHERE id = ?
      `,
      [eventId]
    );
  }

  async saveAggregateState(
    state: AggregateState
  ): Promise<AggregateState> {

    await getDB().query(
      `
      INSERT INTO aggregates (
        id,
        aggregateId,
        aggregateType,
        version,
        lastEventId,
        lastGlobalPosition,
        updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        version = excluded.version,
        lastEventId = excluded.lastEventId,
        lastGlobalPosition = excluded.lastGlobalPosition,
        updatedAt = excluded.updatedAt
      `,
      [
        state.id,
        state.aggregateId,
        state.aggregateType,
        state.version,
        state.lastEventId,
        Number(
          state.lastGlobalPosition ?? 0n
        ),
        Date.now()
      ]
    );

    return state;
  }

  async saveConflict(
    conflict: SyncConflict,
    resolution: ConflictResolution
  ): Promise<void> {

    await getDB().query(
      `
      INSERT INTO conflicts (
        id,
        aggregateId,
        aggregateType,
        conflict,
        resolution,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        crypto.randomUUID(),
        conflict.aggregateId,
        conflict.aggregateType,
        JSON.stringify(conflict),
        JSON.stringify(resolution),
        Date.now()
      ]
    );
  }

  async markConflict(
    eventId: string,
    reason: string
  ): Promise<void> {

    await getDB().query(
      `
      UPDATE events
      SET
        status = 'CONFLICT',
        lastError = ?,
        nextRetryAt = NULL
      WHERE id = ?
      `,
      [
        reason,
        eventId
      ]
    );
  }
}