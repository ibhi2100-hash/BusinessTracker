// branchRelation.ts

import { Event } from "../domain/event.js";

export function branchRelationData(
  event: Event
) {

  if (
    !event.branchId ||
    !event.businessId
  ) {
    return {
      branchId: null,
      branchBusinessId: null,
    };
  }

  return {
    branchId: event.branchId,
    branchBusinessId:
      event.businessId,
  };
}