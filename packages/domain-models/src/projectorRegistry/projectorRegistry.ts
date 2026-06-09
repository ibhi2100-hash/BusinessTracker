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
      projection: "product"
    }
  ],

  [InventoryEventType.PRODUCT_UPDATED]: [
    {
      reducer: ProductReducer,
      projection: "product"
    }
  ],
   [InventoryEventType.PRODUCT_DELETED]: [
    {
      reducer: ProductReducer,
      projection: "product"
    }
  ],
   [OpeningEventType.OPENING_INVENTORY_CREATED]: [
    {
      reducer: InventoryReducer,
      projection: "inventory"
    }
  ],
   [InventoryEventType.INVENTORY_ADDED]: [
    {
      reducer: InventoryReducer,
      projection: "inventory"
    }
  ],
   [BusinessEventTypes.BUSINESS_CREATED]: [
    {
      reducer: BusinessReducer,
      projection: "business"
    }
  ],
   [BusinessEventTypes.BUSINESS_ACTIVATION]: [
    {
      reducer: BusinessReducer,
      projection: "business"
    }
  ],
[salesEventType.SALE_ADDED]: [
    {
      reducer: SaleReducer,
      projection: "sales"
    }
  ],
   [BusinessEventTypes.BRANCH_CREATED]: [
    {
      reducer: BranchReducer,
      projection: "branches"
    }
  ],
   [BusinessEventTypes.BRANCH_SWITCH]: [
    {
      reducer: BranchReducer,
      projection: "branches"
    }
  ],
   
};