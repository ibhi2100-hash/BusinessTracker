import { AppDB }
  from "@/src/db";

import { reducers }
  from "../events/reducers/reducerRegistry";

export async function rebuildAggregateState(

  db: AppDB,

  aggregateId: string,

  aggregateType: string
) {

  const events =
    await db.events
      .where("[aggregateType+aggregateId]")
      .equals([
        aggregateType,
        aggregateId
      ])
      .sortBy("logicClock");

  let state: any = null;

  for (const event of events) {

    const reducer =
      reducers[event.aggregateType];

    if (!reducer) {
      continue;
    }

    state =
      reducer.reduce(
        state,
        event
      );
  }

  return {
    state,
    version:
      events.length,

    lastEventId:
      events.at(-1)?.id,
  };
}