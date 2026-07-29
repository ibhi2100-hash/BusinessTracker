// SQLiteSnapshotRepository.ts

import { Snapshot } from "@business/shared-types";
import { getDB } from "../database/db";
import { SnapshotRepository } from "./SnapshotRepository";

export class SQLiteSnapshotRepository
  implements SnapshotRepository {

  async save(
    snapshot: Snapshot
  ): Promise<void> {

    await getDB().query(
      `
      INSERT INTO snapshots (
        id,
        aggregateId,
        aggregateType,
        version,
        lastGlobalPosition,
        state,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        version = excluded.version,
        lastGlobalPosition = excluded.lastGlobalPosition,
        state = excluded.state,
        createdAt = excluded.createdAt
      `,
      [
        snapshot.id,
        snapshot.aggregateId,
        snapshot.aggregateType,
        snapshot.version,
        Number(
          snapshot.lastGlobalPosition ?? 0n
        ),
        JSON.stringify(snapshot.state),
        snapshot.createdAt
      ]
    );
  }

  async saveMany(
    snapshots: Snapshot[]
  ): Promise<void> {

    for (const snapshot of snapshots) {
      await this.save(snapshot);
    }
  }

  async getLatest(
    aggregateId: string,
    aggregateType: string
  ): Promise<Snapshot | null> {

    const rows =
      await getDB().query<any>(
        `
        SELECT *
        FROM snapshots
        WHERE aggregateId = ?
        AND aggregateType = ?
        ORDER BY version DESC
        LIMIT 1
        `,
        [
          aggregateId,
          aggregateType
        ]
      );

    const row = rows[0];

    if (!row) return null;

    return {
      ...row,
      state: JSON.parse(row.state),
      lastGlobalPosition:
        row.lastGlobalPosition
          ? BigInt(row.lastGlobalPosition)
          : undefined
    };
  }

  async getVersion(
    aggregateId: string,
    aggregateType: string,
    version: number
  ): Promise<Snapshot | null> {

    const rows =
      await getDB().query<any>(
        `
        SELECT *
        FROM snapshots
        WHERE aggregateId = ?
        AND aggregateType = ?
        AND version = ?
        LIMIT 1
        `,
        [
          aggregateId,
          aggregateType,
          version
        ]
      );

    const row = rows[0];

    if (!row) return null;

    return {
      ...row,
      state: JSON.parse(row.state),
      lastGlobalPosition:
        row.lastGlobalPosition
          ? BigInt(row.lastGlobalPosition)
          : undefined
    };
  }

  async exists(
    aggregateId: string,
    aggregateType: string,
    version: number
  ): Promise<boolean> {

    const rows =
      await getDB().query(
        `
        SELECT id
        FROM snapshots
        WHERE aggregateId = ?
        AND aggregateType = ?
        AND version = ?
        LIMIT 1
        `,
        [
          aggregateId,
          aggregateType,
          version
        ]
      );

    return rows.length > 0;
  }

  async delete(
    aggregateId: string,
    aggregateType: string
  ): Promise<void> {

    await getDB().query(
      `
      DELETE FROM snapshots
      WHERE aggregateId = ?
      AND aggregateType = ?
      `,
      [
        aggregateId,
        aggregateType
      ]
    );
  }
}