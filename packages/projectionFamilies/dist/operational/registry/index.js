"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationalRegistry = void 0;
const shared_types_1 = require("@business/shared-types");
const productReducer_1 = require("../reducers/productReducer");
const inventoryReducer_1 = require("../reducers/inventoryReducer");
const saleReducer_1 = require("../reducers/saleReducer");
const businessReducer_1 = require("../reducers/businessReducer");
const branchReducer_1 = require("../reducers/branchReducer");
exports.operationalRegistry = {
    [shared_types_1.InventoryEventType.PRODUCT_CREATED]: [
        {
            reducer: productReducer_1.ProductReducer,
            projection: "product",
        },
    ],
    [shared_types_1.InventoryEventType.PRODUCT_UPDATED]: [
        {
            reducer: productReducer_1.ProductReducer,
            projection: "product",
        },
    ],
    [shared_types_1.InventoryEventType.PRODUCT_DELETED]: [
        {
            reducer: productReducer_1.ProductReducer,
            projection: "product",
        },
    ],
    [shared_types_1.OpeningEventType.OPENING_INVENTORY_CREATED]: [
        {
            reducer: inventoryReducer_1.InventoryReducer,
            projection: "inventory",
        },
    ],
    [shared_types_1.InventoryEventType.INVENTORY_ADDED]: [
        {
            reducer: inventoryReducer_1.InventoryReducer,
            projection: "inventory",
        },
    ],
    [shared_types_1.InventoryEventType.INVENTORY_SOLD]: [
        {
            reducer: inventoryReducer_1.InventoryReducer,
            projection: "inventory",
        },
    ],
    [shared_types_1.InventoryEventType.INVENTORY_ADJUSTED]: [
        {
            reducer: inventoryReducer_1.InventoryReducer,
            projection: "inventory",
        },
    ],
    [shared_types_1.InventoryEventType.INVENTORY_TRANSFER]: [
        {
            reducer: inventoryReducer_1.InventoryReducer,
            projection: "inventory",
        },
    ],
    [shared_types_1.InventoryEventType.INVENTORY_RECEIVED]: [
        // Inventory projection uses inventory aggregate id
        {
            reducer: inventoryReducer_1.InventoryReducer,
            projection: "inventory",
            aggregateResolver: (event) => event.aggregateId,
        },
        // Product projection uses product id
        {
            reducer: productReducer_1.ProductReducer,
            projection: "product",
            aggregateResolver: (event) => event.payload.productId,
        },
    ],
    [shared_types_1.salesEventType.SALE_ADDED]: [
        {
            reducer: saleReducer_1.SaleReducer,
            projection: "sales",
        },
    ],
    [shared_types_1.BusinessEventTypes.BUSINESS_CREATED]: [
        {
            reducer: businessReducer_1.BusinessReducer,
            projection: "business",
        },
    ],
    [shared_types_1.BusinessEventTypes.BUSINESS_ACTIVATION]: [
        {
            reducer: businessReducer_1.BusinessReducer,
            projection: "business",
        },
    ],
    [shared_types_1.BusinessEventTypes.BRANCH_CREATED]: [
        {
            reducer: branchReducer_1.BranchReducer,
            projection: "branches",
        },
    ],
    [shared_types_1.BusinessEventTypes.BRANCH_SWITCH]: [
        {
            reducer: branchReducer_1.BranchReducer,
            projection: "branches",
        },
    ],
};
