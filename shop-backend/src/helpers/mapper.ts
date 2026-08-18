
import { DomainEvent } from "@business/shared-types";

export function toDomainEvent(event: DomainEvent) {

  const base = {
    id: event.id,

    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,
    expectedAggregateVersion: event.expectedAggregateVersion,
    aggregateVersion: event.aggregateVersion,

    type: event.type,

    payload: normalizePayload(event.payload),

    businessId: event.businessId,
    branchId: event.branchId,

    mode: event.mode,

    logicClock: event.logicClock,

    actor: event.actor,
    
    createdAt: event.createdAt,

    causationId: event.causationId
  };


  return base;
}
function normalizePayload(
  payload: unknown
): Record<string, unknown> {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload)
  ) {
    return payload as Record<string, unknown>;
  }

  return {};
}