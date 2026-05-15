import { rebaseAggregate }
  from "../rebase/rebaseAggregate";

export async function resolveConflict(

  db,

  conflict
) {

  await rebaseAggregate(
    db,
    {

      aggregateId:
        conflict.aggregateId,

      aggregateType:
        conflict.aggregateType,

      serverVersion:
        conflict.serverVersion,

      serverSnapshot:
        conflict.snapshot,

      serverEvents:
        conflict.serverEvents,

      pendingEvents:
        conflict.pendingEvents,
    }
  );
}