// /offline/inventory/inventoryWatcher.ts
import { inventoryHelper } from "@/offline/inventory/inventoryHelper";
import { useInventoryStore } from "@/store/inventoryStore";

let watcherInterval: number | null = null;

/**
 * Starts a periodic watcher to sync inventory (categories, brands, products) from IndexedDB.
 * @param intervalMs Interval in milliseconds (default 1s)
 */
export function startInventoryWatcher(intervalMs = 1000) {
  if (watcherInterval) return; // already running

  watcherInterval = window.setInterval(async () => {
    const store = useInventoryStore.getState();
    const { selectedCategoryId, selectedBrandId } = store;

    try {
      // 1️⃣ Fetch latest categories
      const categories = await inventoryHelper.getCategories();
      store.setCategories(categories);

      // 2️⃣ Fetch brands for active category
      if (selectedCategoryId) {
        const brands = await inventoryHelper.getBrandsByCategory(selectedCategoryId);
        store.setBrands(brands);
      }

      // 3️⃣ Fetch products for active brand
      if (selectedBrandId) {
        const products = await inventoryHelper.getProductsByBrand(selectedBrandId);
        store.setProducts(products);
      }

    } catch (err) {
      console.error("Inventory watcher failed:", err);
    }
  }, intervalMs);
}

/**
 * Stops the inventory watcher.
 */
export function stopInventoryWatcher() {
  if (watcherInterval !== null) {
    clearInterval(watcherInterval);
    watcherInterval = null;
  }
}