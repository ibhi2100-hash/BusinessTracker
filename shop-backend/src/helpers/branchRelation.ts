// branchRelation.ts
import { BaseEvent } from "@business/shared-types";

export function branchRelationData(
  event: BaseEvent
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