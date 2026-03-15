import { useInventoryStore } from "@/store/inventoryStore";
import { dispatchEvent } from "@/offline/events/eventDispatcher";
import { inventoryHelper } from "@/offline/inventory/inventoryHelper";
import { getDb } from "@/offline/db/indexDB";
import { createEvent } from "@/offline/events/eventFactory";
import { InventoryEventType } from "@/offline/events/eventGroups/inventoryEvents";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { generateLedgerEntries } from "@/offline/ledger/ledgerGenerator";
import { createEntity } from "@/offline/entities/entityFactory";
import { getByIndex } from "@/offline/db/helpers";
import { TABLES } from "@/offline/db/schema";


export const inventoryController = {
 
    
    async loadCategories(){
        const cachedCategories = await inventoryHelper.getCategories();;

        if(cachedCategories.length){
            useInventoryStore.getState().setCategories(cachedCategories)
        }
    },

    async loadBrands(categoryId: string){
       const brands = await inventoryHelper.getBrandsByCategory(categoryId)
       useInventoryStore.getState().setBrands(brands)
    },

    async loadProducts(brandId: string){
        const products = await inventoryHelper.getProductsByBrand(brandId)
        console.log("products From indexDb: ", products)

        useInventoryStore.getState().setProducts(products)
    },

async addOrUpdateProduct(productInput: any) {

  const db = await getDb()
  const userId = useAuthStore.getState().user.id;
  const businessId = useBusinessStore.getState().business.id;
  const branchId = useBranchStore.getState().activeBranchId;

  const normalizedCategory =
    productInput.categoryName.trim().toLowerCase()

  // CATEGORY
  const categories = await getByIndex(
    TABLES.CATEGORIES,
    "by_name",
    normalizedCategory
  )
  let category = categories[0]

  if (!category) {

    category = await inventoryHelper.addCategory({
      name: normalizedCategory,
      businessId,
    })
  }

  // BRAND
 const brands = await inventoryHelper.getBrandsByCategory(category.id)

const normalizedBrand = productInput.brandName.trim().toLowerCase()

let brand = brands.find(
  (b: any) => b.name.trim().toLowerCase() === normalizedBrand
)

if (!brand) {
  brand = await inventoryHelper.addBrands({
    name: normalizedBrand,
    categoryId: category.id,
    businessId
  })
}

  // PRODUCT
 const product = createEntity({
  name: productInput.name,
  imageUrl: productInput.imageUrl ?? "",
  description: productInput.description,
  sellingPrice: productInput.sellingPrice,
  costPrice: productInput.costPrice,
  quantity: productInput.quantity,
  type: productInput.type,
  stockMode: productInput.stockMode,
  model: productInput.model,
  imei: productInput.imei,
  condition: productInput.condition,
  categoryId: category.id,
  brandId: brand.id,
  brandName: brand.name,
  categoryName: category.name,

  businessId,
  branchId
})

  const inventoryStore = useInventoryStore.getState()

const existing = inventoryStore.products.find(
  (p) => p.id === product.id
)


if (existing) {
  const event = await createEvent(InventoryEventType.PRODUCT_UPDATED, userId, businessId, branchId, product, "pending");
   await dispatchEvent(event);
  await generateLedgerEntries(event)
  inventoryStore.updateProduct(product)
} else {

  inventoryStore.addProduct(product)
  const event = await createEvent(InventoryEventType.PRODUCT_CREATED, userId, businessId, branchId, product, "pending");
  await dispatchEvent(event);
  await generateLedgerEntries(event)
}

  

  await inventoryHelper.addProducts(product)
}

}