import { financeEventType } from "./eventGroups/financeEvent";
import { InventoryEventType } from "./eventGroups/inventoryEvents";
import { OpeninigEventType } from "./eventGroups/openingEvents";
import { salesEventType } from "./eventGroups/salesEvent";

export const eventValidators: Record<string, (event: any) => boolean> = {

  // ✅ BOOTSTRAP EVENT
  BUSINESS_CREATED: (event) => {
  const p = event.payload;

  return (
    !!event.userId &&
    event.businessId == null &&
    event.branchId == null &&
    typeof p.business?.id === "string" &&
    typeof p.business?.name === "string" &&
    typeof p.branch?.id === "string" &&
    typeof p.branch?.name === "string"
  );
},
//Opening Event 
[OpeninigEventType.OPENING_INVENTORY_CREATED]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.quantity === "number" &&
      p.quantity > 0 &&
      typeof p.costPrice === "number"
    );
  },


  // ✅ OPERATIONAL EVENT
  [InventoryEventType.PRODUCT_CREATED]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.name === "string" &&
      typeof p.cost === "number" &&
      typeof p.price === "number"
    );
  },


};