// SQLiteAggregateRepository.ts

import { getDB } from "../database/db";

import {
  AggregateRecord
} from "../domain/aggregate";

import {
  AggregateRepository
} from "./AggregateRepository";

export class SQLiteAggregateRepository
implements AggregateRepository {

  async get(
    aggregateId: string,
    aggregateType: string
  ): Promise<AggregateRecord | null> {

    const rows =
      await getDB().query<AggregateRecord>(
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

    const row = rows[0];

    if (!row) {
      return null;
    }

    return {
      ...row,
      lastGlobalPosition:
        row.lastGlobalPosition
          ? BigInt(row.lastGlobalPosition)
          : undefined
    };
  }

  async save(
    aggregate: AggregateRecord
  ): Promise<void> {

    await getDB().query(
      `
      INSERT INTO aggregates (
        id,
        aggregateId,
        aggregateType,
        version,
        lastEventId,
        lastGlobalPosition,
        lastSnapshotVersion,
        updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        version = excluded.version,
        lastEventId = excluded.lastEventId,
        lastGlobalPosition = excluded.lastGlobalPosition,
        lastSnapshotVersion = excluded.lastSnapshotVersion,
        updatedAt = excluded.updatedAt
      `,
      [
        aggregate.id,
        aggregate.aggregateId,
        aggregate.aggregateType,
        aggregate.version,
        aggregate.lastEventId,
        Number(
          aggregate.lastGlobalPosition ?? 0n
        ),
        aggregate.lastSnapshotVersion,
        aggregate.updatedAt
      ]
    );
  }

  async exists(
    aggregateId: string,
    aggregateType: string
  ): Promise<boolean> {

    const rows =
      await getDB().query(
        `
        SELECT id
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

    return rows.length > 0;
  }

  async updateVersion(
    aggregateId: string,
    aggregateType: string,
    version: number,
    eventId?: string,
    globalPosition?: bigint
  ): Promise<void> {

    const existing =
      await this.get(
        aggregateId,
        aggregateType
      );

    if (!existing) {

      await this.save({

        id:
          `${aggregateType}-${aggregateId}`,

        aggregateId,

        aggregateType,

        version,

        lastEventId: eventId,

        lastGlobalPosition:
          globalPosition,

        updatedAt:
          Date.now()
      });

      return;
    }

    await getDB().query(
      `
      UPDATE aggregates
      SET
        version = ?,
        lastEventId = ?,
        lastGlobalPosition = ?,
        updatedAt = ?
      WHERE id = ?
      `,
      [
        version,
        eventId,
        Number(
          globalPosition ?? 0n
        ),
        Date.now(),
        existing.id
      ]
    );
  }

  async all(): Promise<AggregateRecord[]> {

    const rows =
      await getDB().query<AggregateRecord>(
        `
        SELECT *
        FROM aggregates
        ORDER BY updatedAt DESC
        `
      );

    return rows.map(row => ({
      ...row,
      lastGlobalPosition:
        row.lastGlobalPosition
          ? BigInt(row.lastGlobalPosition)
          : undefined
    }));
  }
}