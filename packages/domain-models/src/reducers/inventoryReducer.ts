import { OpeningEventType } from "@business/shared-types";
import { InventoryEventType } from "@business/shared-types";
import { salesEventType } from "@business/shared-types";
import { BaseEvent } from "@business/shared-types";

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