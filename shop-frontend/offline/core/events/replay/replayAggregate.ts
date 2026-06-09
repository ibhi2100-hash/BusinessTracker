import { AppDB }
  from "@/src/db";

import { AggregateRegistry }
  from "../aggregate/aggregateRegistry";
import { IndexedDbProjectionEngine } from "../projectors/projectEngine";

export async function replayAggregate(

  db: AppDB,

  events: any[]

) {

  for (const event of events) {

    const projection = new IndexedDbProjectionEngine();
    projection.process(event)

    await AggregateRegistry.applyEvent(
      db,
      event
    );
  }
}