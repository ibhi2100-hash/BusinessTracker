import { BusinessEventTypes } from "@business/shared-types";
import { financeEventType } from "@business/shared-types";
import { InventoryEventType } from "@business/shared-types";
import { OpeningEventType } from "@business/shared-types";
import { salesEventType } from "@business/shared-types";

export const eventValidators: Record<string, (event: any) => boolean> = {

/*======================================================================
  | ✅ BUSINESS AND BRANCHS OPERATION
=======================================================================*/

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

/*======================================================================
  | ✅ OPENING OPERATIONS
=======================================================================*/

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





/*======================================================================
  | ✅ PRODUCT MASTER DATA OPERATIONS
=======================================================================*/
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

  /*======================================================================
  | ✅ INVENTORY OPERATIONS
=======================================================================*/
    [InventoryEventType.INVENTORY_ADDED]: (event) => {
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

  [InventoryEventType.INVENTORY_UPDATED]: (event) => {
      const p = event.payload;

      return (
        !!event.businessId &&
        !!event.branchId &&
        typeof p.productId === "string" &&
        typeof p.quantityDelta === "number"
      );
    },

  [InventoryEventType.INVENTORY_ADJUSTED]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.productId === "string" &&
      typeof p.quantity ===
      "number" &&

    Number.isFinite(p.quantity) &&

    p.quantity >= 0 &&
    
      typeof p.reason === "string"
    )
  },

  [InventoryEventType.INVENTORY_RECEIVED]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.productId === "string" &&
      typeof p.quantity ===
      "number" &&

    Number.isFinite(p.quantity) &&

    p.quantity >= 0
    )
  },

  [InventoryEventType.INVENTORY_TRANSFER]: (event) => {
    const p = event.payload;

    return (
      !!event.businessId &&                     // REQUIRED here
      !!event.branchId &&
      typeof p.productId === "string" &&
      typeof p.quantity ===
      "number" &&

    Number.isFinite(p.quantity) &&

    p.quantity >= 0 &&
     typeof p.targetBranchId === "string"
    );
  },

  [InventoryEventType.INVENTORY_SOLD]: (event) => {
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