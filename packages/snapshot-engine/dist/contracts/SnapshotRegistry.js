"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotRegistry = void 0;
class SnapshotRegistry {
    constructor() {
        this.reducers = new Map();
    }
    register(reducer) {
        this.reducers.set(reducer.aggregateType, reducer);
    }
    get(aggregateType) {
        return this.reducers.get(aggregateType);
    }
}
exports.SnapshotRegistry = SnapshotRegistry;
