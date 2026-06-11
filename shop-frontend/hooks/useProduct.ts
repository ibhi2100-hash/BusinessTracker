import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useBranchStore } from "@/src/store/useBranchStore";

export function useInventoryProducts() {
  const userId =
    useAuthStore((s) => s.user?.id);

  const branchId =
    useBranchStore((s) => s.activeBranchId);

  const products = useLiveQuery(async () => {
    if (!userId || !branchId) return [];

    const db = getDb(userId);

    const [inventory, productRows] =
      await Promise.all([
        db.inventory
          .where("branchId")
          .equals(branchId)
          .toArray(),

        db.products
          .where("branchId")
          .equals(branchId)
          .toArray(),
      ]);

    const productMap = new Map(
      productRows.map((p) => [p.id, p])
    );

    return inventory.map((inv) => {
      const product =
        productMap.get(inv.productId);

      return {
        id: inv.productId,
        name: product?.name ?? "Unknown",
        price: product?.price ?? 0,
        costPrice: product?.costPrice ?? 0,
        category: product?.category ,
        quantity: inv.quantity,
        businessId: product?.businessId,
        branchId: product?.branchId,
        isActive: true,
      };
    });
  }, [userId, branchId]);

  return products ?? [];
}