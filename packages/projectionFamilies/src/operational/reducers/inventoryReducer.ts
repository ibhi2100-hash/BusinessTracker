import { OpeningEventType } from "@business/shared-types";
import { InventoryEventType } from "@business/shared-types";
import { salesEventType } from "@business/shared-types";
import { IntegrationEvent } from "@business/shared-types";

export const InventoryReducer = {

    initialState: () => ({
    id: "",
    productId: "",
    branchId: "",
    businessId: "",
    quantity: 0,
    costPrice: 0,

  }),

  reduce(current: any, event: IntegrationEvent) {
    
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

        if (!current) return current;

        return {
          ...current,

          quantity:
            current.quantity +
            event.payload.quantityDelta,

          updatedAt: event.createdAt,
        };

      // =========================
      // STOCK RECEIVED
      // =========================
      case InventoryEventType.INVENTORY_RECEIVED:
        if (!current) return current;

        return {
          ...current,

          quantity:
            current.quantity +
            event.payload.quantity,
            costPrice: event.payload.costPrice,
            updatedAt: event.createdAt,
        };

      // =========================
      // STOCK ADJUSTMENT
      // =========================
      case InventoryEventType.INVENTORY_ADJUSTED:
        
        if (!current) return current;

        return {
          ...current,

          quantity: 
            event.payload.direction === "increase" 
              ? current.quantity + event.payload.quantity
              : current.quantity - event.payload.quantity,

          updatedAt: event.createdAt,
        };

      // =========================
      // STOCK TRANSFER
      // =========================
      case InventoryEventType.INVENTORY_TRANSFER:
        
        if (!current) return current;

        return {
          ...current,

          quantity:
            current.quantity -
            event.payload.quantity,

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