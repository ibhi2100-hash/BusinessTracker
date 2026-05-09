import { AppDB } from "@/src/db";
import { BaseEvent } from "../../types";


export const InventoryHandler = {
  async openingInventory(db: AppDB, event: BaseEvent) {
    const { id,  productId, quantity, costPrice } = event.payload;

    const existing = await db.inventory
      .where("[productId+branchId]")
      .equals([productId, event.branchId])
      .first();

    if (existing) {
      await db.inventory.update(existing.id, {
        quantity: existing.quantity + quantity,
        updatedAt: Date.now()
      });
    } else {
      await db.inventory.add({
        id,
        productId,
        branchId: event.branchId,
        quantity,
        costPrice,
        updatedAt: Date.now()
      });
    }
  },
  async update(db: AppDB, event: BaseEvent) {
  const { productId, quantityDelta } = event.payload;

  const existing = await db.inventory
    .where("[productId+branchId]")
    .equals([productId, event.branchId])
    .first();

  if (!existing) return;

  await db.inventory.update(existing.id, {
    quantity: existing.quantity + quantityDelta,
    updatedAt: Date.now(),
  });
}
}