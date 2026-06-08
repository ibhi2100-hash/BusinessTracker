"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reducers = void 0;
const productReducer_1 = require("../reducers/productReducer");
const inventoryReducer_1 = require("../reducers/inventoryReducer");
const businessReducer_1 = require("../reducers/businessReducer");
const dashboardReducer_1 = require("../reducers/dashboardReducer");
const branchReducer_1 = require("../reducers/branchReducer");
exports.reducers = {
    PRODUCT: productReducer_1.ProductReducer,
    INVENTORY: inventoryReducer_1.InventoryReducer,
    BUSINESS: businessReducer_1.BusinessReducer,
    BRANCH: branchReducer_1.BranchReducer,
    DASHBOARD: dashboardReducer_1.DashboardReducer,
};
