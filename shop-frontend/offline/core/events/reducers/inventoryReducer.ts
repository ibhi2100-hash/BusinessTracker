import { BaseEvent } from "../types";

export const InventoryReducer = {

  reduce(
    current: any,
    event: BaseEvent
  ) {

    switch (event.type) {

      case "OPENING_INVENTORY_CREATED":

        return {

          id:
            event.payload.id,

          productId:
            event.payload.productId,

          branchId:
            event.branchId,

          quantity:
            event.payload.quantity,

          costPrice:
            event.payload.costPrice,

          updatedAt:
            event.createdAt,
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
            event.createdAt,
        };

      default:
        return current;
    }
  }
};