"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeSnapshotPolicy = void 0;
class CompositeSnapshotPolicy {
    constructor(policies) {
        this.policies = policies;
    }
    shouldSnapshot(context) {
        return this.policies.some(p => p.shouldSnapshot(context));
    }
}
exports.CompositeSnapshotPolicy = CompositeSnapshotPolicy;
