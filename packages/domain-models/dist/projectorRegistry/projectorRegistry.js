"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectorRegistry = void 0;
const productReducer_1 = require("../reducers/productReducer");
const inventoryReducer_1 = require("../reducers/inventoryReducer");
const businessReducer_1 = require("../reducers/businessReducer");
const branchReducer_1 = require("../reducers/branchReducer");
const shared_types_1 = require("@business/shared-types");
const saleReducer_1 = require("../reducers/saleReducer");
exports.projectorRegistry = {
    [shared_types_1.InventoryEventType.PRODUCT_CREATED]: [
        {
            reducer: productReducer_1.ProductReducer,
            projection: "product"
        }
    ],
    [shared_types_1.InventoryEventType.PRODUCT_UPDATED]: [
        {
            reducer: productReducer_1.ProductReducer,
            projection: "product"
        }
    ],
    [shared_types_1.InventoryEventType.PRODUCT_DELETED]: [
        {
            reducer: productReducer_1.ProductReducer,
            projection: "product"
        }
    ],
    [shared_types_1.OpeningEventType.OPENING_INVENTORY_CREATED]: [
        {
            reducer: inventoryReducer_1.InventoryReducer,
            projection: "inventory"
        }
    ],
    [shared_types_1.InventoryEventType.INVENTORY_ADDED]: [
        {
            reducer: inventoryReducer_1.InventoryReducer,
            projection: "inventory"
        }
    ],
    [shared_types_1.BusinessEventTypes.BUSINESS_CREATED]: [
        {
            reducer: businessReducer_1.BusinessReducer,
            projection: "business"
        }
    ],
    [shared_types_1.BusinessEventTypes.BUSINESS_ACTIVATION]: [
        {
            reducer: businessReducer_1.BusinessReducer,
            projection: "business"
        }
    ],
    [shared_types_1.salesEventType.SALE_ADDED]: [
        {
            reducer: saleReducer_1.SaleReducer,
            projection: "sales"
        }
    ],
    [shared_types_1.BusinessEventTypes.BRANCH_CREATED]: [
        {
            reducer: branchReducer_1.BranchReducer,
            projection: "branches"
        }
    ],
    [shared_types_1.BusinessEventTypes.BRANCH_SWITCH]: [
        {
            reducer: branchReducer_1.BranchReducer,
            projection: "branches"
        }
    ],
};
