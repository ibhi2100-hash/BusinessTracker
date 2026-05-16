import { Event as PrismaEvent } from "../infrastructure/postgresql/prisma/generated/client.js";
import { Event as DomainEvent } from "../domain/event.js";

export function toDomainEvent(event: PrismaEvent): DomainEvent {
  return {
    id: event.id,

    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,
    aggregateVersion: event.aggregateVersion,

    expectedAggregateVersion: null,

    type: event.type,

    // 🔥 FIX 1: normalize payload
    payload: normalizePayload(event.payload),

    businessId: event.businessId ?? null,
    branchId: event.branchId ?? null,
    branchBusinessId: event.branchBusinessId ?? null,

    mode: event.mode,

    // 🔥 FIX 2: bigint → number
    logicClock: Number(event.logicClock),

    scope: event.scope as any,

    deviceId: event.deviceId,
    userId: event.userId ?? null,

    status: event.status as any,
    synced: event.synced,

    isCreationEvent: event.isCreationEvent ?? false,

    causationId: event.causationId ?? undefined,
    correlationId: event.correlationId ?? undefined,

    createdAt: event.createdAt,
  };
}

/**
 * ensures payload always matches Record<string, any>
 */
function normalizePayload(payload: any): Record<string, any> {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  return payload;
}