"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEngine = void 0;
const groupEventsByAggregate_1 = require("../helpers/groupEventsByAggregate");
const ConflictResolution_1 = require("../contracts/ConflictResolution");
class SyncEngine {
    constructor(repository, api, retryEngine, conflictResolver) {
        this.repository = repository;
        this.api = api;
        this.retryEngine = retryEngine;
        this.conflictResolver = conflictResolver;
    }
    async sync() {
        const pending = await this.repository.getPendingEvents();
        if (!pending.length)
            return;
        const groups = (0, groupEventsByAggregate_1.groupByAggregate)(pending);
        for (const group of groups) {
            const baseState = await this.repository.getAggregateState(group.aggregateId, group.aggregateType);
            const baseVersion = baseState.version ?? 0;
            await this.syncAggregate(group.aggregateId, group.aggregateType, baseVersion, group.events);
        }
    }
    async syncAggregate(aggregateId, aggregateType, baseVersion, events) {
        await this.repository.markSyncingBatch(events.map(e => e.id));
        const result = await this.api.syncAggregate(aggregateId, aggregateType, baseVersion, events);
        await this.processSuccess(result.success);
        await this.processFailures(events, result.failed);
        await this.processConflicts(events, result.conflicts);
    }
    async processSuccess(success) {
        for (const item of success) {
            await this.repository.markSynced(item.eventId, item.aggregateVersion, item.globalPosition);
        }
    }
    async processFailures(events, failures) {
        for (const failure of failures) {
            const event = events.find(e => e.id === failure.eventId);
            if (!event)
                continue;
            if (failure.retryable) {
                await this.retryEngine.schedule(event, failure.message);
            }
            else {
                await this.repository.markDead(event.id, failure.message);
            }
        }
    }
    async processConflicts(events, conflicts) {
        for (const conflict of conflicts) {
            const localEvents = events.filter(e => e.aggregateId === conflict.aggregateId);
            const resolution = await this.conflictResolver.resolve(conflict, localEvents);
            if (resolution.type === ConflictResolution_1.ResolutionType.RESOLVED) {
                const baseState = await this.repository.getAggregateState(conflict.aggregateId, conflict.aggregateType);
                const retry = await this.api.syncAggregate(conflict.aggregateId, conflict.aggregateType, baseState.version, resolution.events);
                await this.processSuccess(retry.success);
                await this.processFailures(resolution.events, retry.failed);
            }
            else {
                await this.repository.saveConflict(conflict, resolution);
            }
        }
    }
}
exports.SyncEngine = SyncEngine;
