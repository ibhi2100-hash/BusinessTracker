import { AppDB }
  from "@/src/db";

import { AggregateRegistry }
  from "../aggregate/aggregateRegistry";

import { replayAggregate }
  from "../replay/replayAggregate";

import { resetAggregateState }
  from "./resetAggregateState";

import { replaceSnapshot }
  from "./replaceSnapshot";

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

    await replaceSnapshot(

      db,

      aggregateId,

      aggregateType,

      serverSnapshot,

      serverVersion
    );
  }

  /* -----------------------------------
     4. REPLAY SERVER EVENTS
  ----------------------------------- */

  await replayAggregate(
    db,
    serverEvents
  );

  /* -----------------------------------
     5. REPLAY LOCAL PENDING EVENTS
  ----------------------------------- */

  await replayAggregate(
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