import { getDb } from "@/src/db";

export async function getNextAggregateVersion(
  userId: string,
  aggregateType: string,
  aggregateId: string
) {
  const db = getDb(userId);

  if (!db) return 1;

  const latest = await db.events
    .where("[aggregateType+aggregateId]")
    .equals([aggregateType, aggregateId])
    .last();

  return latest ? latest.version + 1 : 1;
}