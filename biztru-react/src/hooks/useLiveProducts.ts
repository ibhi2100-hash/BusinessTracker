// hooks/useLiveProducts.ts
import { useCallback } from "react";
import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";
import type { LiveProduct } from "../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

export function useLiveProducts(
  branchId: string | null | undefined,
  businessId: string
) {
  const app = useApplication();

  const query = useCallback(async (): Promise<LiveProduct[]> => {
    if (!branchId) {
      return [];
    }

    return app.product.getProducts(branchId, businessId);
  }, [app, branchId, businessId]);

  return useLiveQuery<LiveProduct[]>(
    ["products", "inventories", `branch:${branchId ?? "pending"}`],
    query,
    []
  );
}