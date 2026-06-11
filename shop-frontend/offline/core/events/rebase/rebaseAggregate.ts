import { AppDB }
  from "@/src/db";

import { AggregateRegistry }
  from "../aggregate/aggregateRegistry";

import { replayAggregatet }
  from "../replay/replayAggregate";

import { resetAggregateState }
  from "./resetAggregateState";

import { RebasePayload }
  from "./types";

export async function rebaseAggregate(

  db: AppDB,

  payload: RebasePayload

) {

  const {

    aggregateId,

    aggregateType,

    serverVersion,

    serverSnapshot,

    serverEvents,

    pendingEvents,

  } = payload;

  /* -----------------------------------
     1. RESET LOCAL PROJECTIONS
  ----------------------------------- */

  await resetAggregateState(

    db,

    aggregateId,

    aggregateType
  );

  /* -----------------------------------
     2. RESET AGGREGATE VERSION
  ----------------------------------- */

  await AggregateRegistry.forceVersion(

    db,

    aggregateId,

    aggregateType,

    0
  );

  /* -----------------------------------
     3. RESTORE SERVER SNAPSHOT
  ----------------------------------- */

  if (serverSnapshot) {

  }

  /* -----------------------------------
     4. REPLAY SERVER EVENTS
  ----------------------------------- */

  await replayAggregatet(
    db,
    serverEvents
  );

  /* -----------------------------------
     5. REPLAY LOCAL PENDING EVENTS
  ----------------------------------- */

  await replayAggregatet(
    db,
    pendingEvents
  );

  /* -----------------------------------
     6. FINALIZE AGGREGATE VERSION
  ----------------------------------- */

  await AggregateRegistry.forceVersion(

    db,

    aggregateId,

    aggregateType,

    serverVersion +
    pendingEvents.length
  );
}