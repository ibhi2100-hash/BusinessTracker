import { AppDB } from "@/src/db";
import { BaseEvent } from "../../types";
export const handleSale =  {
  async checkOut (db: AppDB, event: BaseEvent) {
    const { items } = event.payload;

    for (const item of items) {
      const existing = await db.inventory
        .where("[productId+branchId]")
        .equals([item.productId, event.branchId])
        .first();

      if (!existing) continue;

      await db.inventory.update(existing.id, {
        quantity: existing.quantity - item.quantity,
        updatedAt: Date.now(),
      });
    }
  },
  async singleSale(db: AppDB, event: BaseEvent){
    const { amount, cost, productId, quantity } = event.payload;
      const existing = await db.inventory
        .where("[productId+branchId]")
        .equals([productId, event.branchId])
        .first();

      if (!existing) return;

      await db.inventory.update(existing.id, {
        quantity: existing.quantity - quantity,
        updatedAt: Date.now(),
      });
  }

}