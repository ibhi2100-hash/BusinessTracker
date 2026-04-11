import { useInventoryStore } from "@/store/inventoryStore";
import { dispatchEvent } from "@/offline/events/eventDispatcher";
import { inventoryHelper } from "@/offline/inventory/inventoryHelper";
import { createEvent } from "@/offline/events/eventFactory";
import { InventoryEventType } from "@/offline/events/eventGroups/inventoryEvents";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { createEntity } from "@/offline/entities/entityFactory";



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

        useInventoryStore.getState().setProducts(products)
    },

async addOrUpdateProduct(productInput: any) {
  const user = useAuthStore.getState().user;
  const business = useBusinessStore.getState().business;
  const branchId = useBranchStore.getState().activeBranchId;
  const productStore = useInventoryStore.getState();

  if (!user) throw new Error("User not authenticated");
  if (!business) throw new Error("Business not loaded");
  if (!branchId) throw new Error("Active branch required");

  // -----------------------------
  // ✅ VALIDATION
  // -----------------------------
  if (!productInput.categoryId && !productInput.categoryName) {
    throw new Error("Category is required");
  }

  if (!productInput.brandId && !productInput.brandName) {
    throw new Error("Brand is required");
  }

  // -----------------------------
  // ✅ RESOLVE CATEGORY + BRAND (NO DB WRITES HERE)
  // -----------------------------
  const categoryId = productInput.categoryId ?? crypto.randomUUID();
  const brandId = productInput.brandId ?? crypto.randomUUID();

  // -----------------------------
  // ✅ DETERMINE UPDATE VS CREATE
  // -----------------------------
  const isUpdate = !!productInput.id;

  const product = isUpdate
    ? updateEntity(productInput, {
        categoryId,
        brandId,
      })
    : createEntity({
        ...productInput,
        categoryId,
        brandId,
        businessId: business.id,
        branchId,
      });
  // -----------------------------
  // ✅ CREATE EVENT FIRST
  // -----------------------------
  const eventType = isUpdate
    ? InventoryEventType.PRODUCT_UPDATED
    : InventoryEventType.PRODUCT_CREATED;

  const event = await createEvent(
    eventType,
    user.id,
    business.id,
    branchId,
    product,
    "pending"
  );
  // -----------------------------
  // ✅ DISPATCH (ONLY WRITE PATH)
  // -----------------------------
  dispatchEvent(event);

  // -----------------------------
  // ✅ OPTIMISTIC UI UPDATE
  // -----------------------------
   if (isUpdate) {
    productStore.hydrate(product);
  } else {
    productStore.hydrate(product);
  }

  return product;
}
}