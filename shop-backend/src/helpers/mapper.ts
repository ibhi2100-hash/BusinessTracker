import { Event as PrismaEvent } from "../infrastructure/postgresql/prisma/generated/client.js";
import { Event as DomainEvent } from "../domain/event.js";

export function toDomainEvent(event: PrismaEvent): DomainEvent {

  const base: DomainEvent = {
    id: event.id,

    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,
    aggregateVersion: event.aggregateVersion,

    expectedAggregateVersion: null,

    type: event.type,

    payload: normalizePayload(event.payload),

    businessId: event.businessId ?? null,
    branchId: event.branchId ?? null,
    branchBusinessId: event.branchBusinessId ?? null,

    mode: event.mode,

    logicClock: Number(event.logicClock),

    scope: event.scope as any,

    deviceId: event.deviceId,
    userId: event.userId ?? null,

    status: event.status as any,
    synced: event.synced,

    isCreationEvent: event.isCreationEvent ?? false,

    createdAt: event.createdAt,
  };

  // 🔥 ONLY ADD OPTIONAL FIELDS IF THEY EXIST
  if (event.causationId !== null && event.causationId !== undefined) {
    base.causationId = event.causationId;
  }

  if (event.correlationId !== null && event.correlationId !== undefined) {
    base.correlationId = event.correlationId;
  }

  return base;
}

function normalizePayload(payload: any): Record<string, any> {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  return payload;
}