import { AppDB } from "@/src/db";
import { InventoryReducer } from "../reducers/inventoryReducer";
import { BaseEvent } from "../types";

export async function projectInventory(
  db: AppDB,
  event: BaseEvent
) {

  const current =
    await db.inventory
      .where("productId")
      .equals(event.payload.productId)
      .first();
      
  const next =
    InventoryReducer.reduce(
      current,
      event
    );

  if (!next) {
    return;
  }

  await db.inventory.put(next);
}