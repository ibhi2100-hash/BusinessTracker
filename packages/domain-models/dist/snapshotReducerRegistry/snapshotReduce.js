"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotReducerRegistry = void 0;
class SnapshotReducerRegistry {
    reducers = new Map();
    register(reducer) {
        this.reducers.set(reducer.aggregateType, reducer);
    }
    get(aggregateType) {
        return this.reducers.get(aggregateType);
    }
    getAll() {
        return Array.from(this.reducers.values());
    }
}
exports.SnapshotReducerRegistry = SnapshotReducerRegistry;
