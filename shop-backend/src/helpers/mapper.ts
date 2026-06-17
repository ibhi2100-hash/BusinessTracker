import { Event as PrismaEvent } from "../infrastructure/postgresql/prisma/generated/client.js";
import { BaseEvent as DomainEvent } from "@business/shared-types";

export function toDomainEvent(event: PrismaEvent): DomainEvent {

  const base: DomainEvent = {
    id: event.id,

    aggregateId: event.aggregateId,
    aggregateType: event.aggregateType,
    aggregateVersion: event.aggregateVersion,

    type: event.type,

    payload: normalizePayload(event.payload),

    businessId: event.businessId ?? null,
    branchId: event.branchId ?? null,

    mode: event.mode,

    logicClock: typeof event.logicClock === "bigint" ? Number(event.logicClock) : (event.logicClock as unknown as number),

    scope: event.scope as any,

    deviceId: event.deviceId,
    userId: event.userId ?? null,

    status: event.status as any,
    synced: event.synced,

    isCreationEvent: event.isCreationEvent ?? false,

    createdAt: event.createdAt,
  };

  // ONLY SET IF EXISTS
  if (event.causationId !== null) {
    base.causationId = event.causationId;
  }

  if (event.correlationId !== null) {
    base.correlationId = event.correlationId;
  }

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