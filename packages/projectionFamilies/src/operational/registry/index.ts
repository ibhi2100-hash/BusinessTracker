import {
  InventoryEventType,
  OpeningEventType,
  salesEventType,
  BusinessEventTypes,
  BaseEvent,
} from "@business/shared-types";

import { ProductReducer } from "../reducers/productReducer";
import { InventoryReducer } from "../reducers/inventoryReducer";
import { SaleReducer } from "../reducers/saleReducer";
import { BusinessReducer } from "../reducers/businessReducer";
import { BranchReducer } from "../reducers/branchReducer";
import { ProjectionHandler } from "../types/types";

export const operationalRegistry: Record<
  string,
  ProjectionHandler[]
  >  = {

  [InventoryEventType.PRODUCT_CREATED]: [
    {
      reducer: ProductReducer,
      projection: "product",
    },
  ],

  [InventoryEventType.PRODUCT_UPDATED]: [
    {
      reducer: ProductReducer,
      projection: "product",
    },
  ],

  [InventoryEventType.PRODUCT_DELETED]: [
    {
      reducer: ProductReducer,
      projection: "product",
    },
  ],

  [OpeningEventType.OPENING_INVENTORY_CREATED]: [
    {
      reducer: InventoryReducer,
      projection: "inventory",
    },
  ],

  [InventoryEventType.INVENTORY_ADDED]: [
    {
      reducer: InventoryReducer,
      projection: "inventory",
    },
  ],

  [InventoryEventType.INVENTORY_SOLD]: [
    {
      reducer: InventoryReducer,
      projection: "inventory",
    },
  ],

  [InventoryEventType.INVENTORY_ADJUSTED]: [
    {
      reducer: InventoryReducer,
      projection: "inventory",
    },
  ],

  [InventoryEventType.INVENTORY_TRANSFER]: [
    {
      reducer: InventoryReducer,
      projection: "inventory",
    },
  ],

  [InventoryEventType.INVENTORY_RECEIVED]: [
    // Inventory projection uses inventory aggregate id
    {
      reducer: InventoryReducer,
      projection: "inventory",
      aggregateResolver: (event: BaseEvent) => event.aggregateId,
    },

    // Product projection uses product id
    {
      reducer: ProductReducer,
      projection: "product",
      aggregateResolver: (event: BaseEvent) => event.payload.productId,
    },
  ],

  [salesEventType.SALE_ADDED]: [
    {
      reducer: SaleReducer,
      projection: "sales",
    },
  ],

  [BusinessEventTypes.BUSINESS_CREATED]: [
    {
      reducer: BusinessReducer,
      projection: "business",
    },
  ],

  [BusinessEventTypes.BUSINESS_ACTIVATION]: [
    {
      reducer: BusinessReducer,
      projection: "business",
    },
  ],

  [BusinessEventTypes.BRANCH_CREATED]: [
    {
      reducer: BranchReducer,
      projection: "branches",
    },
  ],

  [BusinessEventTypes.BRANCH_SWITCH]: [
    {
      reducer: BranchReducer,
      projection: "branches",
    },
  ],
};