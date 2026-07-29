// SQLiteAggregateRepository.ts


import { StorageBus } from "../../../bus/StorageBus";
import { StorageBusCreator } from "../../../bus/StorageBusCreator";
import { DatabaseTarget } from "../../../protocol/DatabaseTarget";
import {
  AggregateRecord
} from "./aggregate";

import {
  AggregateRepository
} from "./contract";

export class SQLiteAggregateRepository
implements AggregateRepository {
  private static instance: SQLiteAggregateRepository;
  private storage: StorageBus

  constructor(){
    this.storage = StorageBusCreator()
  }

  static getInstance(): SQLiteAggregateRepository {
    if(!SQLiteAggregateRepository.instance){
      SQLiteAggregateRepository.instance =
        new SQLiteAggregateRepository()
    }

    return SQLiteAggregateRepository.instance
  }
  async get(
    aggregateId: string
  ): Promise<AggregateRecord | null> {

    const rows =
      await this.storage.query<AggregateRecord>(
        DatabaseTarget.BUSINESS,
        `
        SELECT *
        FROM aggregates
        WHERE aggregateId = ?
        LIMIT 1
        `,
        [
          aggregateId,
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

    await this.storage.query(
      DatabaseTarget.BUSINESS,
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
          aggregate.lastGlobalPosition 
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
      await this.storage.query(
        DatabaseTarget.BUSINESS,
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

    await this.storage.query(
      DatabaseTarget.BUSINESS,
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
          globalPosition
        ),
        Date.now(),
        existing.id
      ]
    );
  }

  async all(): Promise<AggregateRecord[]> {

    const rows =
      await this.storage.query<AggregateRecord>(
        DatabaseTarget.BUSINESS,
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