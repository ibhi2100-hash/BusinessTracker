import { financeEventType } from "./eventGroups/financeEvent";
import { InventoryEventType } from "./eventGroups/inventoryEvents";
import { salesEventType } from "./eventGroups/salesEvent";

export const eventValidators: Record<string, (event: any) => boolean> = {
  // SALES
  [salesEventType.SALE_ADDED]: (event) => {
    const p = event.payload;
    return (
      typeof p.amount === "number" &&
      p.amount > 0 &&
      typeof p.cost === "number"
    );
  },

  // INVENTORY
  [InventoryEventType.PRODUCT_CREATED]: (event) => {
    const p = event.payload;
    return (
      typeof p.quantity === "number" &&
      p.quantity > 0 &&
      typeof p.costPrice === "number"
    );
  },

  // FINANCE
  [financeEventType.EXPENSES_ADDED]: (event) => {
    return typeof event.payload.amount === "number" && event.payload.amount > 0;
  },

  [financeEventType.LIABILITY_ADDED]: (event) => {
    return typeof event.payload.principalAmount === "number";
  },
};