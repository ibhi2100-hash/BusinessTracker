import {
  Inventory,
  BaseEvent
} from "@business/shared-types";

import { SnapshotReducer } from "@business/snapshot-engine";

export const InventorySnapshotReducer:
SnapshotReducer<Inventory | null> = {

  aggregateType: "INVENTORY",

  initialState() {
    return null;
  },

  reduce(current: any, event: BaseEvent) {

    switch (event.type) {

      case "OPENING_INVENTORY_CREATED":

        return {

          id:
            event.aggregateId,

          aggregateId:
            event.aggregateId,

          aggregateType:
            event.aggregateType,

          productId:
            event.payload.productId,

          quantity:
            event.payload.quantity,

          costPrice:
            event.payload.costPrice,

          branchId:
            event.branchId,

          updatedAt:
            event.createdAt
        };

      case "INVENTORY_ADDED":

        if (!current) {
          return current;
        }

        return {

          ...current,

          quantity:
            current.quantity +
            event.payload.quantityDelta,

          updatedAt:
            event.createdAt
        };

      case "INVENTORY_UPDATED":

        if (!current) {
          return current;
        }

        return {

          ...current,

          quantity:
            current.quantity +
            event.payload.quantityDelta,

          updatedAt:
            event.createdAt
        };

      case "SALE_ADDED":

        if (!current) {
          return current;
        }

        return {

          ...current,

          quantity:
            current.quantity -
            event.payload.quantity,

          updatedAt:
            event.createdAt
        };

      default:
        return current;
    }
  }
};