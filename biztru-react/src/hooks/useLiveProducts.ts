// hooks/useLiveProducts.ts
import { useCallback } from "react";
import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext"; 
import { useLiveQuery } from "./useLiveQuery";
import type{ LiveProduct } from "../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository"; 

export function useLiveProducts(branchId: string | null) {
  const app = useApplication();

  const query = useCallback(async () => {
    if (!branchId) return [];
    return app.product.getProducts(branchId);
  }, [app, branchId]);

  return useLiveQuery<LiveProduct[]>(
    ["products", "inventories"],
    query,
    []
  );
}