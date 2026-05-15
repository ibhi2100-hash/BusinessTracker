import { AppDB }
  from "@/src/db";

import { BaseEvent }
  from "../types"

export async function updateAggregateVersion(

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

  const nextVersion =
    currentVersion + 1;

  await db.aggregates.put({

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

    lastLogicClock:
      event.logicClock,

    updatedAt:
      event.createdAt,
  });

  return nextVersion;
}