import { ProductReducer } from "../reducers/productReducer";
import { InventoryReducer } from "../reducers/inventoryReducer";
import { BusinessReducer } from "../reducers/businessReducer";
import { BranchReducer } from "../reducers/branchReducer";
import { BusinessEventTypes, InventoryEventType, OpeningEventType, salesEventType } from "@business/shared-types";
import { SaleReducer } from "../reducers/saleReducer";

export const projectorRegistry = {

  [InventoryEventType.PRODUCT_CREATED]: [
    {
      reducer: ProductReducer,
      target: "products"
    }
  ],

  [InventoryEventType.PRODUCT_UPDATED]: [
    {
      reducer: ProductReducer,
      target: "products"
    }
  ],
   [InventoryEventType.PRODUCT_DELETED]: [
    {
      reducer: ProductReducer,
      target: "products"
    }
  ],
   [OpeningEventType.OPENING_INVENTORY_CREATED]: [
    {
      reducer: InventoryReducer,
      target: "inventory"
    }
  ],
   [InventoryEventType.INVENTORY_ADDED]: [
    {
      reducer: InventoryReducer,
      target: "inventory"
    }
  ],
   [BusinessEventTypes.BUSINESS_CREATED]: [
    {
      reducer: BusinessReducer,
      target: "business"
    }
  ],
   [BusinessEventTypes.BUSINESS_ACTIVATION]: [
    {
      reducer: BusinessReducer,
      target: "business"
    }
  ],
[salesEventType.SALE_ADDED]: [
    {
      reducer: SaleReducer,
      target: "sales"
    }
  ],
   [BusinessEventTypes.BRANCH_CREATED]: [
    {
      reducer: BranchReducer,
      target: "branches"
    }
  ],
   [BusinessEventTypes.BRANCH_SWITCH]: [
    {
      reducer: BranchReducer,
      target: "branches"
    }
  ],
   
};