"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotEngine = void 0;
class SnapshotEngine {
    async process(aggregateId, reducer, event) {
        const snapshot = await this.repo.get(aggregateId);
        const currentState = snapshot?.state ??
            reducer.initialState();
        const nextState = reducer.reduce(currentState, event);
        await this.repo.save({
            aggregateId,
            state: nextState
        });
    }
}
exports.SnapshotEngine = SnapshotEngine;
