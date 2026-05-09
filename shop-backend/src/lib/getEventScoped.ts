import { Event, EventScope } from "../domain/event.js";

export function getEventScope(event: Event): EventScope {
  switch (event.type) {
    case "BUSINESS_CREATED":
      return "GLOBAL";

    case "BUSINESS_ACTIVATION":
    case "BRANCH_CREATED":
    case "BRANCH_SWITCH":
      return "BUSINESS";
    case "PRODUCT_CREATED":
      return "BUSINESS";

    case "SALE_ADDED":
    case "OPENING_INVENTORY_CREATED":
      return "BRANCH";

    default:
      throw new Error(`Unknown event type: ${event.type}`);
  }
}