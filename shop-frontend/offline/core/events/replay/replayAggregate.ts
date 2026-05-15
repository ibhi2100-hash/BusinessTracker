import { AppDB }
  from "@/src/db";

import { projectors }
  from "../projectors/index";

import { AggregateRegistry }
  from "../aggregate/aggregateRegistry";

export async function replayAggregate(

  db: AppDB,

  events: any[]

) {

  for (const event of events) {

    const eventProjectors =
      projectors[event.type] ?? [];

    for (const projector of eventProjectors) {

      await projector(
        db,
        event
      );
    }

    await AggregateRegistry.applyEvent(
      db,
      event
    );
  }
}