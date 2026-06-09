import { AppDB } from "@/src/db";

export async function loadCurrentState(
  db: AppDB,
  target: string,
  aggregateId: string
) {

  switch (target) {

    case "products":
      return db.products
        .where("aggregateId")
        .equals(aggregateId)
        .toArray();
    

    case "inventory":
      return db.inventory
        .where("aggregateId")
        .equals(aggregateId)
        .toArray();
    

    case "business":
      return db.businesses
        .where("aggregateId")
        .equals(aggregateId)
        .toArray();
    
    case "branches":
      return db.branches
        .where("aggregateId")
        .equals(aggregateId)
        .toArray();
    
    default:
      return null;
  }
}