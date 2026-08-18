import { DomainEvent } from "@business/shared-types";

export function getEventScope(event: DomainEvent) {

  if (event.branchId) {
    return "BRANCH";
  }

  if (event.businessId) {
    return "BUSINESS";
  }

  return "GLOBAL";
}