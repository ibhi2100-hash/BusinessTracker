"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotPolicyRegistry = void 0;
class SnapshotPolicyRegistry {
    constructor() {
        this.policies = new Map();
    }
    register(aggregateType, policy) {
        this.policies.set(aggregateType, policy);
    }
    get(aggregateType) {
        return this.policies.get(aggregateType);
    }
}
exports.SnapshotPolicyRegistry = SnapshotPolicyRegistry;
