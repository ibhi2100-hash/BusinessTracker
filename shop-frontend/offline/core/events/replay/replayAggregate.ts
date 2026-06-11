import { AppDB }
  from "@/src/db";

import { AggregateRegistry }
  from "../aggregate/aggregateRegistry";

export async function replayAggregatet(

  db: AppDB,

  events: any[]

) {
  
  for (const event of events) {

    await AggregateRegistry.applyEvent(
      db,
      event
    );
  }
}