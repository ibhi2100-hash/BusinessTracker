import { AppDB }
  from "@/src/db";

import { BaseEvent }
  from "@business/shared-types";

import { AggregateRecord }
  from "../../../domain/aggregate";

export class AggregateRegistry {

  /* ----------------------------------------
     GET AGGREGATE
  ---------------------------------------- */

  static async getAggregate(

    db: AppDB,

    aggregateId: string,

    aggregateType: string

  ): Promise<AggregateRecord | undefined> {

    return db.aggregates
      .where("[aggregateType+aggregateId]")
      .equals([
        aggregateType,
        aggregateId
      ])
      .first();
  }

  /* ----------------------------------------
     GET CURRENT VERSION
  ---------------------------------------- */

  static async getVersion(

    db: AppDB,

    aggregateId: string,

    aggregateType: string

  ): Promise<number> {

    const aggregate =
      await this.getAggregate(
        db,
        aggregateId,
        aggregateType
      );

    return aggregate?.version ?? 0;
  }

  /* ----------------------------------------
     ENSURE VERSION MATCH
  ---------------------------------------- */

  static async validateExpectedVersion(

    db: AppDB,

    event: BaseEvent

  ) {

    const currentVersion =
      await this.getVersion(
        db,
        event.aggregateId,
        event.aggregateType
      );

    const expected =
      event.expectedAggregateVersion ?? 0;

    if (currentVersion !== expected) {

      throw new Error(

        `LOCAL_VERSION_CONFLICT expected=${expected} current=${currentVersion}`
      );
    }
  }

  /* ----------------------------------------
     APPLY EVENT VERSION
  ---------------------------------------- */

  static async applyEvent(

    db: AppDB,

    event: BaseEvent

  ) {

    const existing =
      await this.getAggregate(
        db,
        event.aggregateId,
        event.aggregateType
      );

    const currentVersion =
      existing?.version ?? 0;

    const nextVersion =
      currentVersion + 1;

    const aggregate: AggregateRecord = {

      id:
        `${event.aggregateType}:${event.aggregateId}`,

      aggregateId:
        event.aggregateId,

      aggregateType:
        event.aggregateType,

      version:
        nextVersion,

      lastEventId:
        event.id,

      lastLogicClock: event.logicClock,

      updatedAt:
        event.createdAt,
    };

    await db.aggregates.put(
      aggregate
    );

    return aggregate;
  }

  /* ----------------------------------------
     REPLACE VERSION
     (used during rebase)
  ---------------------------------------- */

  static async forceVersion(

    db: AppDB,

    aggregateId: string,

    aggregateType: string,

    version: number

  ) {

    const existing =
      await this.getAggregate(
        db,
        aggregateId,
        aggregateType
      );

    await db.aggregates.put({

      id:
        `${aggregateType}:${aggregateId}`,

      aggregateId,

      aggregateType,

      version,

      lastEventId:
        existing?.lastEventId,

      lastLogicClock:
        existing?.lastLogicClock,

      updatedAt:
        new Date(),
    });
  }

  /* ----------------------------------------
     REMOVE AGGREGATE
  ---------------------------------------- */

  static async removeAggregate(

    db: AppDB,

    aggregateId: string,

    aggregateType: string

  ) {

    const id =
      `${aggregateType}:${aggregateId}`;

    await db.aggregates.delete(id);
  }

  /* ----------------------------------------
     RESET ALL
     (used for full rebuild)
  ---------------------------------------- */

  static async clearAll(
    db: AppDB
  ) {

    await db.aggregates.clear();
  }
}