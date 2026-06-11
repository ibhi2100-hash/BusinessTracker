"use strict";
// analytics/registry/index.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRegistry = void 0;
const inventoryAnalyticsReducer_1 = require("../reducers/inventoryAnalyticsReducer");
exports.analyticsRegistry = {
    inventoryMetrics: [
        {
            reducer: inventoryAnalyticsReducer_1.InventoryAnalyticsReducer,
            projection: "inventory_metrics"
        }
    ],
};
