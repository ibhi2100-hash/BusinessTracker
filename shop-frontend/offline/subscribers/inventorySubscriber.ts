// src/offline/subscribers/inventorySubscriber.ts

import { liveQuery } from "dexie";
import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useInventoryStore } from "@/src/store/inventoryStore";
import { useBranchStore } from "@/src/store/useBranchStore";

let subscription: any;

export function startInventorySubscriber() {
  const userId = useAuthStore.getState().user?.id;
  const branchId = useBranchStore.getState().activeBranchId;

  if (!userId || !branchId) return;

  const db = getDb(userId);
  if (!db) return;

  subscription = liveQuery(async () => {
    const inventory = await db.inventory
      .where("branchId")
      .equals(branchId)
      .toArray();

    const products = await db.products
      .where("branchId")
      .equals(branchId)
      .toArray();

    // 🔗 JOIN (critical)
    return inventory.map((inv) => {
      const product = products.find(p => p.id === inv.productId);

      return {
        id: inv.productId,
        stockMode: product.stockMode,
        name: product?.name ?? "Unknown",
        price: product?.price ?? 0,
        cost: product?.cost ?? 0,
        quantity: inv.quantity,
        businessId: product.businessId,
        branchId: product.branchId,
        isActive: true,
      };
    });
  }).subscribe({
    next: (data) => {
      useInventoryStore.getState().setProducts(data);
    },
    error: (err) => {
      console.error("[InventorySubscriber]", err);
    }
  });
}

export function stopInventorySubscriber() {
  if (subscription) {
    subscription.unsubscribe();
  }
}