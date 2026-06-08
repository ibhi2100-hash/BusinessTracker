"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotEngine = void 0;
class SnapshotEngine {
    constructor(repo, registry) {
        this.repo = repo;
        this.registry = registry;
    }
    async process(event) {
        const reducer = this.registry.get(event.aggregateType);
        if (!reducer)
            return;
        const snapshotKey = this.buildSnapshotKey(event);
        const snapshot = await this.repo.get(snapshotKey);
        const currentState = snapshot?.state ??
            reducer.initialState();
        const nextState = reducer.reduce(currentState, event);
        const nextVersion = event.aggregateVersion ?? 0;
        const nextEventCount = (snapshot?.eventCount ?? 0) + 1;
        await this.repo.save({
            id: snapshotKey,
            snapshotKey,
            snapshotType: event.aggregateType,
            scope: event.scope,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            businessId: event.businessId ?? undefined,
            branchId: event.branchId ?? undefined,
            state: nextState,
            version: nextVersion,
            eventCount: nextEventCount,
            lastGlobalPosition: Number(event.globalPosition),
            updatedAt: Date.now(),
            createdAt: snapshot?.createdAt ?? Date.now()
        });
    }
    buildSnapshotKey(event) {
        return `${event.scope}:${event.aggregateType}:${event.aggregateId}`;
    }
}
exports.SnapshotEngine = SnapshotEngine;
