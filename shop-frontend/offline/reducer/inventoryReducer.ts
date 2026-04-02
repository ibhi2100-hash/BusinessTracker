import { BaseEvent } from "../events/eventFactory";
import { TABLES } from "@/offline/db/schema";

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
      store.add(payload)
      categoryStore.add(categoryData);
      brandStore.add(brandData)
      break

    case "PRODUCT_UPDATED":
      store.put(event.payload)

    default:
      return;
    
  }
}
    