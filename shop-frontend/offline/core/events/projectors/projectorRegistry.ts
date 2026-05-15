import { OpeninigEventType } from "../../../../../shared/domain/events";
import { BusinessEventTypes } from "../eventGroups/businessEvents";
import { InventoryEventType } from "../eventGroups/inventoryEvents";
import { projectInventory } from "./inventory.projector";
import { projectProduct } from "./product.projector";
import { projectBranch } from "./project.branch";
import { projectBusiness } from "./project.business";

export const projectors = {
  [BusinessEventTypes.BUSINESS_CREATED]: [
    projectBusiness
  ],
  [BusinessEventTypes.BRANCH_CREATED]: [
    projectBranch
  ],
  [BusinessEventTypes.BUSINESS_ACTIVATION]: [
    projectBusiness
  ],

  [InventoryEventType.PRODUCT_CREATED]: [
    projectProduct
  ],

  [InventoryEventType.PRODUCT_UPDATED]: [
    projectProduct
  ],

  [InventoryEventType.PRODUCT_DELETED]: [
    projectProduct
  ],
  [OpeninigEventType.OPENING_INVENTORY_CREATED]: [
    projectInventory
  ]
};