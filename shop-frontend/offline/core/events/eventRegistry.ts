import { BusinessEventTypes } from "@business/shared-types";
import { financeEventType } from "@business/shared-types";
import { InventoryEventType } from "@business/shared-types";
import { OpeningEventType } from "@business/shared-types";
import { salesEventType } from "@business/shared-types";

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
    p.name.trim().length > 0 &&
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
    p.name.trim().length > 0 &&
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
[OpeningEventType.OPENING_INVENTORY_CREATED]: (event) => {
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
      p.name.trim().length > 0 &&
      typeof p.price ===
      "number" &&

    Number.isFinite(p.price) &&

    p.price >= 0 &&

    typeof p.costPrice ===
      "number" &&

    Number.isFinite(
      p.costPrice
    ) &&

    p.costPrice >= 0
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
  // ✅ OPERATIONAL EVENT
  [InventoryEventType.PRODUCT_UPDATED]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.productId === "string" &&
      typeof p.name === "string" &&
      typeof p.price ===
      "number" &&

    Number.isFinite(p.price) &&

    p.price >= 0 &&

    typeof p.costPrice ===
      "number" &&

    Number.isFinite(
      p.costPrice
    ) &&

    p.costPrice >= 0
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