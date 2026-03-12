import { getCategories, addProducts, addCategories, addBrands, getBrandsByCategory, getProductsByBrand } from "@/offline/db/helpers";
import { useInventoryStore } from "@/store/inventoryStore";
import { dispatchEvent } from "@/offline/events/eventDispatcher";
import { EventTypes } from "@/offline/events/eventTypes";
import { getDb } from "@/offline/db/indexDB";


export const inventoryController = {
    
    async loadCategories(){
        const cachedCategories = await getCategories();

        if(cachedCategories.length){
            useInventoryStore.getState().setCategories(cachedCategories)
        }
    },

    async loadBrands(categoryId: string){
       const brands = await getBrandsByCategory(categoryId)
       useInventoryStore.getState().setBrands(brands)
    },

    async loadProducts(brandId: string){
        const products = await getProductsByBrand(brandId)

        useInventoryStore.getState().setProducts(products)
    },

async addOrUpdateProduct(productInput: any) {

  const db = await getDb()

  const normalizedCategory =
    productInput.categoryName.trim().toLowerCase()

  // CATEGORY
  let category = await db.getFromIndex(
    "categories",
    "by_name",
    normalizedCategory
  )

  if (!category) {

    category = {
      id: crypto.randomUUID(),
      name: normalizedCategory,
      timestamp: Date.now()
    }

    await addCategories([category])
  }

  // BRAND
  const brands = await getBrandsByCategory(category.id)

  let brand = brands.find(
    (b:any) =>
      b.name === productInput.brandName
  )

  if (!brand) {

    brand = {
      id: crypto.randomUUID(),
      name: productInput.brandName,
      categoryId: category.id,
      timestamp: Date.now()
    }

    await addBrands([brand])
  }

  // PRODUCT
  const product = {
    id: productInput.id ?? crypto.randomUUID(),
    name: productInput.name,
    brandId: brand.id,
    categoryId: category.id,
    costPrice: productInput.costPrice,
    sellingPrice: productInput.sellingPrice,
    quantity: productInput.quantity,
    stockMode: productInput.stockMode,
    type: productInput.type,
    imageUrl: productInput.imageUrl,
    timestamp: Date.now()
  }

  const inventoryStore = useInventoryStore.getState()

  inventoryStore.addProduct(product)
const existing = inventoryStore.products.find(
  (p) => p.id === product.id
)

if (existing) {
  inventoryStore.updateProduct(product)
} else {
  inventoryStore.addProduct(product)
}
  await dispatchEvent(
    productInput.id
      ? EventTypes.PRODUCT_UPDATED
      : EventTypes.PRODUCT_CREATED,
    product
  )

  await addProducts([product])
}

}