"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotSyncService = void 0;
class SnapshotSyncService {
    constructor(snapshots) {
        this.snapshots = snapshots;
    }
    async update(state) {
        await this.snapshots.saveSnapshot(state);
    }
    async get(aggregateId, aggregateType) {
        return this.snapshots.getSnapshot(aggregateId, aggregateType);
    }
    async invalidate(aggregateId, aggregateType) {
        await this.snapshots.deleteSnapshot(aggregateId, aggregateType);
    }
}
exports.SnapshotSyncService = SnapshotSyncService;
