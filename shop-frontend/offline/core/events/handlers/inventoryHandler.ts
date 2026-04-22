export const inventoryHandler = async (db, event) => {
  if (event.type !== "SALE_CREATED") return;

  for (const item of event.payload.items) {
    const existing = await db.inventory
      .where("[productId+branchId]")
      .equals([item.productId, event.branchId])
      .first();

    if (existing) {
      await db.inventory.update(existing.id, {
        quantity: existing.quantity - item.quantity,
        updatedAt: Date.now(),
      });
    }
  }
};