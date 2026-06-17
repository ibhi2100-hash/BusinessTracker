import { BaseEvent } from "@business/shared-types";

export function getEventScope(event: BaseEvent) {
  if (event.scope) return event.scope;

  if (event.branchId) {
    return "BRANCH";
  }

  if (event.businessId) {
    return "BUSINESS";
  }

  return "GLOBAL";
}