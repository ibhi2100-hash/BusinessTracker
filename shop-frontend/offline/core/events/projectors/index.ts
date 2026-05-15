import { projectProduct }
  from "./product.projector";

import { projectInventory } from "./inventory.projector";
export const projectors = {

  PRODUCT_CREATED: [
    projectProduct
  ],

  PRODUCT_UPDATED: [
    projectProduct
  ],

  PRODUCT_DELETED: [
    projectProduct
  ],

  OPENING_INVENTORY_CREATED: [
    
  ],

  INVENTORY_ADDED: [
    projectInventory
  ],
};