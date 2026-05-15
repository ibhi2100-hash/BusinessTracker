export async function getPendingEvents(

  db,

  aggregateId,

  aggregateType

) {

  return db.events
    .where("[aggregateType+aggregateId]")
    .equals([
      aggregateType,
      aggregateId
    ])
    .filter(
      x => !x.synced
    )
    .sortBy("logicClock");
}