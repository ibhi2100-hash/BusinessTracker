// operational/registry/index.ts

import { InventoryEventType, OpeningEventType, salesEventType, BusinessEventTypes } from "@business/shared-types";

import { ProductReducer } from "../reducers/productReducer";
import { InventoryReducer } from "../reducers/inventoryReducer";
import { SaleReducer } from "../reducers/saleReducer";
import { BusinessReducer } from "../reducers/businessReducer";
import { BranchReducer } from "../reducers/branchReducer";

export const operationalRegistry = {

  [InventoryEventType.PRODUCT_CREATED]: [
    { reducer: ProductReducer, projection: "product" }
  ],

  [InventoryEventType.PRODUCT_UPDATED]: [
    { reducer: ProductReducer, projection: "product" }
  ],

  [InventoryEventType.PRODUCT_DELETED]: [
    { reducer: ProductReducer, projection: "product" }
  ],

  [OpeningEventType.OPENING_INVENTORY_CREATED]: [
    { reducer: InventoryReducer, projection: "inventory" }
  ],

  [InventoryEventType.INVENTORY_ADDED]: [
    { reducer: InventoryReducer, projection: "inventory" }
  ],

  [InventoryEventType.INVENTORY_SOLD]: [
    { reducer: InventoryReducer, projection: "inventory" }
  ],

  [InventoryEventType.INVENTORY_ADJUSTED]: [
    { reducer: InventoryReducer, projection: "inventory" }
  ],

  [salesEventType.SALE_ADDED]: [
    { reducer: SaleReducer, projection: "sales" }
  ],

  [BusinessEventTypes.BUSINESS_CREATED]: [
    { reducer: BusinessReducer, projection: "business" }
  ],

  [BusinessEventTypes.BUSINESS_ACTIVATION]: [
    { reducer: BusinessReducer, projection: "business" }
  ],

  [BusinessEventTypes.BRANCH_CREATED]: [
    { reducer: BranchReducer, projection: "branches" }
  ],

  [BusinessEventTypes.BRANCH_SWITCH]: [
    { reducer: BranchReducer, projection: "branches" }
  ],
};
 