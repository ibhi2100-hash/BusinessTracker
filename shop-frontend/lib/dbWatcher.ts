// dbWatcher.ts

import { inventoryHelper } from "@/offline/inventory/inventoryHelper";
import { useInventoryStore } from "@/store/inventoryStore";

let interval: any = null;

export function startInventoryWatcher(intervalMs = 1000) {
  if (interval) return; // ✅ prevent duplicates

  interval = setInterval(async () => {
    const store = useInventoryStore.getState();

    const [categories, brands, products] = await Promise.all([
      inventoryHelper.getCategories(),
      store.selectedCategoryId
        ? inventoryHelper.getBrandsByCategory(store.selectedCategoryId)
        : [],
      store.selectedBrandId
        ? inventoryHelper.getProductsByBrand(store.selectedBrandId)
        : [],
    ]);

    // ✅ Single atomic update
    useInventoryStore.setState({
      categories,
      brands,
      products,
    });

  }, intervalMs);
}

export function stopInventoryWatcher() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}