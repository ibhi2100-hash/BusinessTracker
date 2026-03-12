import { Product, useInventoryStore } from "@/store/inventoryStore";
import { dispatchEvent } from "../events/eventDispatcher";
import { EventTypes } from "../events/eventTypes";
import { addProducts } from "../db/helpers";
import { syncEvent } from "../sync/syncEngine";
import { getCategories,getBrandsByCategory, addBrands, addCategories } from "../db/helpers";

const createProduct = async (product: Product)=> {
    const addProduct = useInventoryStore(s=> s.addProduct);

    //optimistic UI
    addProduct(product);

    // snapshot for offline
    await addProducts([product]);

    //queue event for sync
    await dispatchEvent(EventTypes.PRODUCT_CREATED, product);
    
    if(navigator.onLine){
        await syncEvent()
    }
}
export async function createProductOffline(productInput) {

  // 1️⃣ find or create category
  let category = (await getCategories())
      .find(c => c.name === productInput.categoryName);

  if (!category) {
    category = {
      id: crypto.randomUUID(),
      name: productInput.categoryName,
      timestamp: Date.now()
    };

    await addCategories([category]);
  }

  // 2️⃣ find or create brand
  let brand = (await getBrandsByCategory(category.id))
      .find(b =>
          b.name === productInput.brandName &&
          b.categoryId === category.id
      );

  if (!brand) {
    brand = {
      id: crypto.randomUUID(),
      name: productInput.brandName,
      categoryId: category.id,
      timestamp: Date.now()
    };

    await addBrands([brand]);
  }

  // 3️⃣ create product with ids
  const product = {
    id: crypto.randomUUID(),
    name: productInput.name,
    brandId: brand.id,
    categoryId: category.id,
    costPrice: productInput.costPrice,
    sellingPrice: productInput.sellingPrice,
    quantity: productInput.quantity,
    timestamp: Date.now()
  };

  await addProducts([product]);
}