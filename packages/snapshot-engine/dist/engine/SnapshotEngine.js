"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotEngine = void 0;
class SnapshotEngine {
    constructor(repo, registry, ctx) {
        this.repo = repo;
        this.registry = registry;
        this.ctx = ctx;
    }
    async build(aggregateId, aggregateType) {
        const reducer = this.registry.get(aggregateType);
        if (!reducer)
            return;
        // 1. Load existing snapshot
        const snapshot = await this.repo.get(aggregateId);
        const baseVersion = snapshot?.version ?? 0;
        // 2. Load all missing events
        const events = await this.ctx.eventStore.after(aggregateId, baseVersion);
        if (events.length === 0)
            return;
        // 3. Start from snapshot state or initial state
        let state = snapshot?.state ??
            reducer.initialState();
        let lastVersion = baseVersion;
        let eventCount = snapshot?.eventCount ?? 0;
        // 4. Replay ALL events deterministically
        for (const event of events) {
            state = reducer.reduce(state, event);
            lastVersion = event.aggregateVersion;
            eventCount++;
        }
        // 5. Build snapshot key (stable identity)
        const snapshotKey = this.buildSnapshotKey(aggregateType, aggregateId);
        // 6. Persist snapshot
        await this.repo.save({
            id: snapshotKey,
            snapshotKey,
            snapshotType: aggregateType,
            scope: events[0]?.scope ?? snapshot?.scope,
            aggregateId,
            aggregateType,
            businessId: events[0]?.businessId ?? snapshot?.businessId ?? null,
            branchId: events[0]?.branchId ?? snapshot?.branchId ?? null,
            state,
            version: lastVersion,
            eventCount,
            lastGlobalPosition: events[events.length - 1]?.globalPosition ?? snapshot?.lastGlobalPosition ?? 0n,
            checksum: undefined,
            createdAt: snapshot?.createdAt ?? Date.now(),
            updatedAt: Date.now()
        });
    }
    buildSnapshotKey(aggregateType, aggregateId) {
        return `${aggregateType}:${aggregateId}`;
    }
}
exports.SnapshotEngine = SnapshotEngine;
