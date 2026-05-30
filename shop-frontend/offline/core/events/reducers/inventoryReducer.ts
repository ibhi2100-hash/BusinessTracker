import { OpeningEventType } from "../eventGroups/openingEvents";
import { InventoryEventType } from "../eventGroups/inventoryEvents";
import { salesEventType } from "../eventGroups/salesEvent";
import { BaseEvent } from "../types";

export const InventoryReducer = {
  reduce(current: any, event: BaseEvent) {

    switch (event.type) {

      // =========================
      // OPENING STOCK
      // =========================
      case OpeningEventType.OPENING_INVENTORY_CREATED:

        return {
          id: event.aggregateId,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,

          productId: event.payload.productId,

          branchId: event.branchId,

          quantity: event.payload.quantity,

          costPrice: event.payload.costPrice,

          updatedAt: event.createdAt,
        };

      // =========================
      // STOCK INCREMENT
      // =========================
      case InventoryEventType.INVENTORY_ADDED:

        if (!current) return current;

        return {
          ...current,

          quantity:
            current.quantity +
            event.payload.quantityDelta,

          updatedAt: event.createdAt,
        };

      // =========================
      // STOCK ADJUSTMENT
      // =========================
      case InventoryEventType.INVENTORY_UPDATED:
        console.log("Current inventory:", current);
console.log("Incoming event:", event);
        if (!current) return current;

        return {
          ...current,

          quantity:
            current.quantity +
            event.payload.quantityDelta,

          updatedAt: event.createdAt,
        };

      // =========================
      // SALE
      // =========================
      case salesEventType.SALE_ADDED:

        if (!current) return current;

        return {
          ...current,

          quantity:
            current.quantity -
            event.payload.quantity,

          updatedAt:
            event.createdAt,
        };

      default:
        return current;
    }
  }
};