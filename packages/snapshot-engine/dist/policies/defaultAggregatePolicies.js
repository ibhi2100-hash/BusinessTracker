"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotPolicyRegistry = void 0;
const CompositePolicies_1 = require("./CompositePolicies");
const NEventsPolicy_1 = require("./NEventsPolicy");
const TimeBasedPolicy_1 = require("./TimeBasedPolicy");
class SnapshotPolicyRegistry {
    constructor() {
        this.policies = new Map();
        // BUSINESS (slow-changing root aggregate)
        this.policies.set("BUSINESS", new CompositePolicies_1.CompositeSnapshotPolicy([
            new NEventsPolicy_1.EveryNEventsPolicy(20),
            new TimeBasedPolicy_1.TimeBasedPolicy(60 * 60 * 1000) // 1 hour
        ]));
        // PRODUCT (medium churn)
        this.policies.set("PRODUCT", new CompositePolicies_1.CompositeSnapshotPolicy([
            new NEventsPolicy_1.EveryNEventsPolicy(30),
            new TimeBasedPolicy_1.TimeBasedPolicy(10 * 60 * 1000) // 10 min
        ]));
        // INVENTORY (high churn, critical consistency)
        this.policies.set("INVENTORY", new CompositePolicies_1.CompositeSnapshotPolicy([
            new NEventsPolicy_1.EveryNEventsPolicy(10),
            new TimeBasedPolicy_1.TimeBasedPolicy(2 * 60 * 1000) // 2 min
        ]));
        // DASHBOARD (very high churn derived data)
        this.policies.set("DASHBOARD", new NEventsPolicy_1.EveryNEventsPolicy(5));
        // LEDGER (financial safety-critical)
        this.policies.set("LEDGER", new CompositePolicies_1.CompositeSnapshotPolicy([
            new NEventsPolicy_1.EveryNEventsPolicy(5),
            new TimeBasedPolicy_1.TimeBasedPolicy(30 * 1000) // 30 sec
        ]));
    }
    get(type) {
        return this.policies.get(type);
    }
}
exports.SnapshotPolicyRegistry = SnapshotPolicyRegistry;
