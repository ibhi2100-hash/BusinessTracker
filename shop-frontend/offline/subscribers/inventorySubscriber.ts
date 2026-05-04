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
    const [inventory, products] = await Promise.all([
      db.inventory.where("branchId").equals(branchId).toArray(),
      db.products.where("branchId").equals(branchId).toArray(),
    ]);

    // ⚡ build product lookup map (O(1))
    const productMap = new Map(
      products.map((p) => [p.id, p])
    );

    // ⚡ fast merge (single pass)
    const result = inventory.map((inv) => {
      const product = productMap.get(inv.productId);

      return {
        id: inv.productId,
        name: product?.name ?? "Unknown",
        price: product?.price ?? 0,
        costPrice: product?.costPrice ?? 0,
        quantity: inv.quantity,
        businessId: product?.businessId,
        branchId: product?.branchId,
        isActive: true,
      };
    });

    return result;
  }).subscribe({
    next: (data) => {
      // ⚡ prevent unnecessary re-renders
      const store = useInventoryStore.getState();

        for (const p of data) {
        store.upsertProduct(p);
        }
    },
    error: (err) => {
      console.error("[InventorySubscriber]", err);
    },
  });
}

export function stopInventorySubscriber() {
  subscription?.unsubscribe?.();
}