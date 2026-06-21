"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCanonicalEvent = toCanonicalEvent;
function toCanonicalEvent(event) {
    return {
        id: event.id,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        aggregateVersion: event.expectedAggregateVersion ?? 0,
        type: event.type,
        mode: event.mode,
        payload: event.payload,
        businessId: event.businessId ?? null,
        branchId: event.branchId ?? null,
        createdAt: new Date(event.createdAt),
        userId: event.userId ?? "",
        causationId: event.causationId ?? null,
        correlationId: event.correlationId ?? null,
    };
}
