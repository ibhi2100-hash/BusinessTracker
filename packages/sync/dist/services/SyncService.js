"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const groupEventsByAggregate_1 = require("../helpers/groupEventsByAggregate");
class SyncService {
    constructor(repository, aggregateSync, failureService, conflictResolver) {
        this.repository = repository;
        this.aggregateSync = aggregateSync;
        this.failureService = failureService;
        this.conflictResolver = conflictResolver;
    }
    async execute() {
        const pending = await this.repository
            .getPendingEvents();
        if (!pending.length) {
            return;
        }
        const grouped = (0, groupEventsByAggregate_1.groupEventsByAggregate)(pending);
        for (const group of grouped) {
            await this.syncGroup(group);
        }
    }
    async syncGroup(events) {
        try {
            for (const event of events) {
                await this.repository
                    .markSyncing(event.id);
            }
            const result = await this.aggregateSync
                .syncAggregate(events);
            await this.processResult(events, result);
        }
        catch (error) {
            for (const event of events) {
                await this.failureService
                    .failEvent(event, error?.message ??
                    "SYNC_FAILED");
            }
        }
    }
    async processResult(events, result) {
        const { success = [], failed = [], conflicts = [], serverState } = result;
        // SUCCESS
        for (const item of success) {
            await this.repository
                .markSynced(item.eventId, item.aggregateVersion, item.globalPosition);
        }
        // FAILED
        for (const item of failed) {
            const event = events.find(e => e.id ===
                item.eventId);
            if (!event) {
                continue;
            }
            await this.failureService
                .failEvent(event, item.error);
        }
        // SERVER STATE
        if (serverState) {
            await this.repository
                .saveAggregateState(serverState);
        }
        // CONFLICTS
        for (const conflict of conflicts) {
            await this.conflictResolver
                .resolve(conflict);
        }
    }
}
exports.SyncService = SyncService;
