"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResolver = void 0;
const ConflictResolution_1 = require("../contracts/ConflictResolution");
class ConflictResolver {
    constructor(api, strategies) {
        this.api = api;
        this.strategies = strategies;
    }
    async resolve(conflict, pending) {
        const strategy = this.strategies.get(conflict.aggregateType);
        if (!strategy) {
            return {
                type: ConflictResolution_1.ResolutionType.MANUAL,
                events: [],
                reason: "No merge strategy registered."
            };
        }
        const latest = await this.api.getAggregateState(conflict.aggregateId, conflict.aggregateType);
        if (!latest) {
            return {
                type: ConflictResolution_1.ResolutionType.REJECTED,
                events: [],
                reason: "Aggregate no longer exists."
            };
        }
        const serverEvents = await this.api.getEventsSince(latest.lastGlobalPosition);
        return strategy.resolve(conflict, serverEvents, pending);
    }
}
exports.ConflictResolver = ConflictResolver;
