import { AppDB } from "@/src/db";

export const inventoryProjection = {
  async adjust(db: AppDB, productId: string, branchId: string, qty: number) {
    const existing = await db.inventory
      .where("[productId+branchId]")
      .equals([productId, branchId])
      .first();

    if (existing) {
      await db.inventory.update(existing.id, {
        quantity: existing.quantity + qty,
      });
    } else {
      await db.inventory.add({
        id: crypto.randomUUID(),
        productId,
        branchId,
        quantity: qty,
      });
    }
  }
};