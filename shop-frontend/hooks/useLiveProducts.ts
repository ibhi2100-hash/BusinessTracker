// hooks/useLiveProducts.ts
import { changeNotifier } from "@/src/offline/sqlite/businessDatabase/projections/changeNoifier";
import { LiveProduct } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useEffect, useState, useCallback } from "react";



export function useLiveProducts(branchId: string | null) {
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const app = useApplication()

  const load = useCallback(async () => {
    if (!branchId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const products = await app.product.getProducts(branchId);
    const allProducts = await app.product.getAllProducts();
    const allInventories = await app.product.getAllInventories();

    console.log("Product from  Projection Table: ", allProducts)
    console.log("Inventories from Projection: ", allInventories)

    setProducts(products);
    setLoading(false);
  }, [branchId]);

  useEffect(() => {
  load();

  const unsubscribe = changeNotifier.subscribe((tables) => {
    if (tables.includes("products") || tables.includes("inventories")) {
      load();
    }
  });

  // Important: return a function that returns void
  return () => {
    unsubscribe();
  };
}, [load]);

  return { products, loading, refresh: load };
}