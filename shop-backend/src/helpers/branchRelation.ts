// branchRelation.ts
import { DomainEvent } from "@business/shared-types";

export function branchRelationData(
  event: DomainEvent
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