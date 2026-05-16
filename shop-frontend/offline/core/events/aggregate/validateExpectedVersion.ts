import { AppDB }
  from "@/src/db";

import { BaseEvent }
  from "../types";

export async function validateExpectedVersion(

  db: AppDB,

  event: BaseEvent

) {

  const aggregate =
    await db.aggregates
      .where("[aggregateType+aggregateId]")
      .equals([
        event.aggregateType,
        event.aggregateId
      ])
      .first();

  const currentVersion =
    aggregate?.version ?? 0;

  const expected =
    event.expectedAggregateVersion ?? 0;

  if (currentVersion !== expected) {

    throw new Error(

      `LOCAL_VERSION_CONFLICT expected=${expected} current=${currentVersion}`
    );
  }
}