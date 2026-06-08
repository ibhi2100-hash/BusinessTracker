import { BaseEvent } from "@business/shared-types"
import { BusinessEventTypes, OpeningEventType, InventoryEventType , salesEventType} from "@business/shared-types";


export function getEventScope(event: BaseEvent){
  switch (event.type) {
    case BusinessEventTypes.BUSINESS_CREATED:
      return "GLOBAL";

    case BusinessEventTypes.BUSINESS_ACTIVATION:
    case BusinessEventTypes.BRANCH_CREATED:
    case BusinessEventTypes.BRANCH_SWITCH:
      return "BUSINESS"
      ;
    case InventoryEventType.PRODUCT_CREATED:
      return "BUSINESS";

    case salesEventType.SALE_ADDED:
    case OpeningEventType.OPENING_INVENTORY_CREATED:
      return "BRANCH";

    default:
      throw new Error(`Unknown event type: ${event.type}`);
  }
}