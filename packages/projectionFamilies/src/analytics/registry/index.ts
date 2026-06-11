// analytics/registry/index.ts

import { InventoryAnalyticsReducer } from "../reducers/inventoryAnalyticsReducer";

export const analyticsRegistry = {

  inventoryMetrics: [
    {
      reducer: InventoryAnalyticsReducer,
      projection: "inventory_metrics"
    }
  ],

};