import { BaseEvent } from "../events/eventFactory";
import { TABLES } from "@/offline/core/db/schema";

  export function inventoryReducer(tx: IDBTransaction, event: BaseEvent) {
  const store = tx.objectStore(TABLES.PRODUCTS);
  const categoryStore = tx.objectStore(TABLES.CATEGORIES);
  const brandStore = tx.objectStore(TABLES.BRANDS)
  const payload = event.payload;
  const { categoryName, categoryId, brandName, brandId, businessId, branchId } = payload;
  const categoryData = { businessId, branchId, name: categoryName, id: categoryId};
  const brandData = { businessId, branchId, name: brandName, categoryId, id: brandId}
  


  switch (event.type) {

    case "PRODUCT_CREATED":
      store.put(payload); // safe

      if (categoryName) {
        categoryStore.put(categoryData);
      }

      if (brandName) {
        brandStore.put(brandData);
      }

      break;

    case "PRODUCT_UPDATED":
      store.put(event.payload)

    default:
      return;
    
  }
}
    