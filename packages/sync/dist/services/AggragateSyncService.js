"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateSyncService = void 0;
const ConflictType_1 = require("../types/ConflictType");
const classifyErrors_1 = require("../helpers/classifyErrors");
const RetryPolicy_1 = require("../helpers/RetryPolicy");
class AggregateSyncService {
    constructor(repository) {
        this.repository = repository;
    }
    async syncAggregate(events) {
        if (events.length === 0) {
            return {
                success: [],
                failed: [],
                conflicts: []
            };
        }
        const first = events[0];
        const aggregateId = first.aggregateId;
        const aggregateType = first.aggregateType;
        // 1. LOAD SERVER STATE
        const serverState = await this.repository.getAggregateState(aggregateId, aggregateType);
        const serverVersion = serverState?.version ?? 0;
        const clientBaseVersion = first.aggregateVersion ?? 0;
        const lastGlobalPosition = serverState?.lastGlobalPosition ?? 0n;
        const lastEventId = serverState?.lastEventId;
        // 2. CONFLICT DETECTION
        if (serverState &&
            clientBaseVersion !== serverVersion) {
            const conflict = {
                eventId: first.id,
                aggregateId,
                aggregateType,
                type: ConflictType_1.ConflictType.VERSION,
                message: `Version mismatch: client=${clientBaseVersion}, server=${serverVersion}`,
                localVersion: clientBaseVersion,
                clientLastGlobalPosition: first.globalPosition ?? 0n,
                serverVersion,
                serverState
            };
            return {
                success: [],
                failed: [],
                conflicts: [conflict],
                serverState
            };
        }
        // 3. APPLY EVENTS (SERVER AUTHORITATIVE)
        let version = serverVersion;
        let globalPosition = lastGlobalPosition;
        const success = [];
        const failed = [];
        for (const event of events) {
            try {
                version += 1;
                globalPosition += 1n;
                success.push({
                    eventId: event.id,
                    aggregateId,
                    aggregateType,
                    aggregateVersion: version,
                    globalPosition,
                    processedAt: new Date().toISOString()
                });
            }
            catch (err) {
                const message = err?.message ?? "Unknown error";
                failed.push({
                    eventId: event.id,
                    code: (0, classifyErrors_1.classifyError)(message),
                    message,
                    retryable: (0, RetryPolicy_1.isRetryable)(message)
                });
            }
        }
        // 4. BUILD NEW SERVER STATE
        const lastSuccess = success.reduce((prev, curr) => {
            return (!prev || curr.aggregateVersion > prev.aggregateVersion)
                ? curr
                : prev;
        }, undefined);
        const newServerState = success.length > 0
            ? {
                id: aggregateId,
                aggregateId,
                aggregateType,
                version: lastSuccess.aggregateVersion,
                lastEventId: lastSuccess.eventId,
                lastGlobalPosition: lastSuccess.globalPosition,
                updatedAt: new Date()
            }
            : serverState;
        // 5. RETURN RESULT
        return {
            success,
            failed,
            conflicts: [],
            serverState: newServerState
        };
    }
}
exports.AggregateSyncService = AggregateSyncService;
