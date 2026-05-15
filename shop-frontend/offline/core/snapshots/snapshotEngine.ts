import { AppDB }
  from "@/src/db";

import { rebuildAggregateState }
  from "./rebuildAggregateState";

import { AggregateSnapshot }
  from "./types";

export class SnapshotEngine {

  /* -----------------------------------
     UPDATE SNAPSHOT
  ----------------------------------- */

  static async update(

    db: AppDB,

    event: any
  ) {

    const {

      aggregateId,

      aggregateType

    } = event;

    const rebuilt =
      await rebuildAggregateState(

        db,

        aggregateId,

        aggregateType
      );

    const snapshot: AggregateSnapshot = {

      id:
        `${aggregateType}:${aggregateId}`,

      aggregateId,

      aggregateType,

      version:
        rebuilt.version,

      state:
        rebuilt.state,

      lastEventId:
        rebuilt.lastEventId,

      updatedAt:
        event.createdAt,
    };

    await db.snapshots.put(
      snapshot
    );

    return snapshot;
  }

  /* -----------------------------------
     GET SNAPSHOT
  ----------------------------------- */

  static async get(

    db: AppDB,

    aggregateId: string,

    aggregateType: string

  ) {

    return db.snapshots.get(
      `${aggregateType}:${aggregateId}`
    );
  }

  /* -----------------------------------
     DELETE SNAPSHOT
  ----------------------------------- */

  static async remove(

    db: AppDB,

    aggregateId: string,

    aggregateType: string

  ) {

    await db.snapshots.delete(
      `${aggregateType}:${aggregateId}`
    );
  }

  /* -----------------------------------
     REBUILD ALL SNAPSHOTS
  ----------------------------------- */

  static async rebuildAll(
    db: AppDB
  ) {

    const aggregates =
      await db.aggregates.toArray();

    for (const aggregate of aggregates) {

      await this.update(
        db,
        {
          aggregateId:
            aggregate.aggregateId,

          aggregateType:
            aggregate.aggregateType,

          createdAt:
            Date.now(),
        }
      );
    }
  }
}