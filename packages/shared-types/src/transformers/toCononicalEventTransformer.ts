import { CanonicalEvent } from "../events/cononicalEvent";
import { BaseEvent } from "../events/BaseEvent";

export function toCanonicalEvent(event: BaseEvent): CanonicalEvent {
  return {
    id: event.id,

    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,

    aggregateVersion: event.expectedAggregateVersion ?? 0,

    type: event.type,
    payload: event.payload,

    businessId: event.businessId ?? null,
    branchId: event.branchId ?? null,

    createdAt: new Date(event.createdAt),

    userId: event.userId,
    causationId: event.causationId ?? null,
    correlationId: event.correlationId ?? null,
  };
}