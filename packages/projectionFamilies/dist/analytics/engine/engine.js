"use strict";
// analytics/engine/AnalyticsProjectionEngine.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsProjectionEngine = void 0;
const registry_1 = require("../registry");
class AnalyticsProjectionEngine {
    constructor(repo) {
        this.repo = repo;
    }
    async process(input) {
        const handlers = registry_1.analyticsRegistry[input.type] ?? [];
        for (const handler of handlers) {
            const current = await this.repo.load(handler.projection, input.key);
            const next = handler.reducer.reduce(current, input);
            await this.repo.save(handler.projection, input.key, next);
        }
    }
}
exports.AnalyticsProjectionEngine = AnalyticsProjectionEngine;
