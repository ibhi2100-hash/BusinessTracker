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
  const db = await getDb();

  const userId = useAuthStore.getState().user.id;
  const businessId = useBusinessStore.getState().business.id;
  const branchId = useBranchStore.getState().activeBranchId;

  if (!branchId) {
    throw new Error("Active branch is required");
  }

  // -----------------------------
  // ✅ VALIDATION (fail fast)
  // -----------------------------
  if (!productInput.name) throw new Error("Product name is required");
  if (!productInput.categoryId || !productInput.categoryName) {
    throw new Error("Category is required");
  }
  if (!productInput.brandId || !productInput.brandName) {
    throw new Error("Brand is required");
  }

  // -----------------------------
  // ✅ CATEGORY (ID FIRST)
  // -----------------------------
  let category = await db.get(TABLES.CATEGORIES, productInput.categoryId);

  if (!category) {
    category = await inventoryHelper.addCategory({
      id: productInput.categoryId, // 🔥 preserve client-generated ID
      name: productInput.categoryName.trim().toLowerCase(),
      businessId,
      branchId,
      timestamp: Date.now()
    });
  }

  // -----------------------------
  // ✅ BRAND (ID FIRST)
  // -----------------------------
  let brand = await db.get(TABLES.BRANDS, productInput.brandId);

  if (!brand) {
    brand = await inventoryHelper.addBrands({
      id: productInput.brandId, // 🔥 preserve ID
      name: productInput.brandName.trim().toLowerCase(),
      categoryId: category.id,
      businessId,
      branchId,
      timestamp: Date.now()
    });
  }

  // -----------------------------
  // ✅ PRODUCT ENTITY
  // -----------------------------
  const product = createEntity({
    id: productInput.id, // ensure stable ID across sync
    name: productInput.name,
    imageUrl: productInput.imageUrl ?? "",
    description: productInput.description,

    sellingPrice: productInput.sellingPrice,
    costPrice: productInput.costPrice,
    quantity: productInput.quantity,

    type: productInput.type,
    stockMode: productInput.stockMode ?? "OPENING",

    model: productInput.model,
    imei: productInput.imei,
    condition: productInput.condition,

    categoryId: category.id,
    categoryName: category.name,

    brandId: brand.id,
    brandName: brand.name,

    businessId,
    branchId
  });

  // -----------------------------
  // ✅ STORE CHECK (NO DUPLICATE)
  // -----------------------------
  const inventoryStore = useInventoryStore.getState();

  const existing = inventoryStore.products.find(
    (p) => p.id === product.id
  );

  // -----------------------------
  // ✅ EVENT CREATION
  // -----------------------------
  const eventType = existing
    ? InventoryEventType.PRODUCT_UPDATED
    : InventoryEventType.PRODUCT_CREATED;

  const event = await createEvent(
    eventType,
    userId,
    businessId,
    branchId,
    product,
    "pending"
  );

  // -----------------------------
  // ✅ LOCAL STATE UPDATE
  // -----------------------------
  if (existing) {
    inventoryStore.updateProduct(product);
  } else {
    inventoryStore.addProduct(product);
  }

  // -----------------------------
  // ✅ DISPATCH + SIDE EFFECTS
  // -----------------------------
  await dispatchEvent(event);
  await generateLedgerEntries(event);

  // -----------------------------
  // ✅ PERSIST TO INDEXED DB
  // -----------------------------
  await inventoryHelper.addProducts(product);

  return product;
}
}