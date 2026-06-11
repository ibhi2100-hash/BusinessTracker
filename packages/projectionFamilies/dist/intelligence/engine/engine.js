"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligenceProjectionEngine = void 0;
const registry_1 = require("../registry");
class IntelligenceProjectionEngine {
    constructor(repo) {
        this.repo = repo;
    }
    async process(metric) {
        // ensure we can index the registry even if metric.type is typed as any
        const reducers = registry_1.intelligenceRegistry[metric.type] ?? [];
        for (const reducer of reducers) {
            const current = await this.repo.load(reducer.name, metric.key);
            const next = reducer.reduce(current, metric);
            await this.repo.save(reducer.name, metric.key, next);
        }
    }
}
exports.IntelligenceProjectionEngine = IntelligenceProjectionEngine;
