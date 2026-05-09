import { BusinessEventTypes } from "./eventGroups/businessEvents";
import { financeEventType } from "./eventGroups/financeEvent";
import { InventoryEventType } from "./eventGroups/inventoryEvents";
import { OpeninigEventType } from "./eventGroups/openingEvents";
import { salesEventType } from "./eventGroups/salesEvent";

export const eventValidators: Record<string, (event: any) => boolean> = {

  // ✅ BOOTSTRAP EVENT
 [BusinessEventTypes.BUSINESS_CREATED]: (event) => {
  const p = event.payload;

  return (
    !!event.userId &&
    event.businessId == null &&
    event.branchId == null &&
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.address === "string"
  );
},
 [BusinessEventTypes.BRANCH_CREATED]: (event) => {
  const p = event.payload;

  return (
    !!event.userId &&
    !!event.businessId &&
    event.branchId == null &&
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.businessId === "string"
  );
},


 [BusinessEventTypes.BUSINESS_ACTIVATION]: (event) => {

  return (
    !!event.userId &&
    !!event.businessId &&
    !!event.branchId 
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
  [financeEventType.OPENING_CAPITAL]: (event) => {
    const p = event.payload;
    console.log("The payload in the Opening Capital", p)

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.amount === "number" &&
      p.amount > 0
    );
  },




  // ✅ OPERATIONAL EVENT
  [InventoryEventType.PRODUCT_CREATED]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.name === "string" &&
      typeof p.costPrice === "number" &&
      typeof p.price === "number"
    );
  },
  [InventoryEventType.INVENTORY_UPDATED]: (event) => {
  const p = event.payload;

  return (
    !!event.businessId &&
    !!event.branchId &&
    typeof p.productId === "string" &&
    typeof p.quantityDelta === "number"
  );
},
 [financeEventType.CASH_ADDED]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.amount === "number" &&
      p.amount > 0
    );
  },

    [salesEventType.SALE_ADDED]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      !!p.productId &&
      typeof p.productId === "string" &&
      typeof p.amount === "number" &&
      p.amount > 0 &&
      typeof p.costPrice === "number" &&
      typeof p.quantity === "number" &&
      p.quantity > 0
    );
  },


};