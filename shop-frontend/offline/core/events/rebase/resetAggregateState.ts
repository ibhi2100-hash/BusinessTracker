import { AppDB }
  from "@/src/db";

export async function resetAggregateState(

  db: AppDB,

  aggregateId: string,

  aggregateType: string

) {

  switch (aggregateType) {

    case "PRODUCT":

      await db.products.delete(
        aggregateId
      );

      break;

    case "INVENTORY":

      await db.inventory.delete(
        aggregateId
      );

      break;

    case "BUSINESS":

      await db.businesses.delete(
        aggregateId
      );

      break;
  }

  await db.snapshots.delete(
    `${aggregateType}:${aggregateId}`
  );
}