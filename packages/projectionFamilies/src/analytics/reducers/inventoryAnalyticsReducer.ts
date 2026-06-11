// analytics/reducers/inventoryAnalyticsReducer.ts

import { AnalyticsReducer } from "../types/type";
import { InventoryMetrics } from "../types/type";

export const InventoryAnalyticsReducer: AnalyticsReducer<
  InventoryMetrics,
  any
> = {

  initialState: () => ({
    productId: "",
    velocity: 0,
    turnOverRate: 0,
    daysOfStockLeft: 0,
    totalSold: 0,
    totalReceived: 0,
    lastUpdated: Date.now(),
  }),

  reduce(state, input) {

    const now = Date.now();

    switch (input.type) {

      case "INVENTORY_PROJECTION_UPDATED": {

        const { quantity, productId } = input.payload;

        // simple velocity approximation
        const timeDeltaDays =
          (now - state.lastUpdated) / (1000 * 60 * 60 * 24);

        const velocity =
          state.totalSold / Math.max(timeDeltaDays, 1);

        return {
          ...state,
          productId,
          velocity,
          daysOfStockLeft:
            velocity > 0 ? quantity / velocity : 9999,
          lastUpdated: now,
        };
      }

      case "SALE_PROJECTION_UPDATED": {

        const qty = input.payload.quantity;

        return {
          ...state,
          totalSold: state.totalSold + qty,
        };
      }

      case "INVENTORY_RECEIVED_PROJECTION_UPDATED": {

        const qty = input.payload.quantity;

        return {
          ...state,
          totalReceived: state.totalReceived + qty,
        };
      }

      default:
        return state;
    }
  }
};