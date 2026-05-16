import { AppDB }
  from "@/src/db";

export async function replaceSnapshot(

  db: AppDB,

  aggregateId: string,

  aggregateType: string,

  snapshot: any,

  version: number,

) {

  await db.snapshots.put({

    id:
      `${aggregateType}:${aggregateId}`,
    
    aggregateId,

    aggregateType,

    version,

    state:
      snapshot,

    updatedAt:
      Date.now(),
  });
}