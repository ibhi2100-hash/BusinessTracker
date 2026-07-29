import { CheckpointRepository } from "./contract";
import { getDB } from "../../sqlite/database/db";

export class SQLiteCheckpointRepository
implements CheckpointRepository {

  async getLastPosition() {

    const rows =
      await getDB().query<any>(
        `
        SELECT *
        FROM checkpoints
        LIMIT 1
        `
      );

    if (!rows.length) {
      return 0n;
    }

    return BigInt(
      rows[0].globalPosition
    );
  }

  async saveLastPosition(
    position: bigint
  ) {

    await getDB().query(
      `
      INSERT INTO checkpoints (
        id,
        globalPosition
      )
      VALUES (
        'main',
        ?
      )

      ON CONFLICT(id)
      DO UPDATE SET
        globalPosition =
        excluded.globalPosition
      `,
      [
        Number(position)
      ]
    );
  }
}