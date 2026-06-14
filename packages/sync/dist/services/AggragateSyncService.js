"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateSyncService = void 0;
class AggregateSyncService {
    constructor(repository, transport) {
        this.repository = repository;
        this.transport = transport;
    }
    async syncAggregate(events) {
        const first = events[0];
        const synced = await this.repository
            .getSyncedEvents(first.aggregateId, first.aggregateType);
        const last = synced[synced.length - 1];
        const baseVersion = last?.aggregateVersion ??
            0;
        return this.transport
            .syncAggregate({
            aggregateId: first.aggregateId,
            aggregateType: first.aggregateType,
            baseVersion,
            events
        });
    }
}
exports.AggregateSyncService = AggregateSyncService;
