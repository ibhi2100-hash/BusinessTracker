import { Event } from "../domain/event.js";

export function getEventScope(event: Event) {
  if (event.scope) return event.scope;

  if (event.branchId) {
    return "BRANCH";
  }

  if (event.businessId) {
    return "BUSINESS";
  }

  return "GLOBAL";
}