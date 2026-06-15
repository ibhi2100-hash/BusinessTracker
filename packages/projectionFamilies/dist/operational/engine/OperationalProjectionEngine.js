"use strict";
// operational/engine/OperationalProjectionEngine.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationalProjectionEngine = void 0;
const index_1 = require("../registry/index");
class OperationalProjectionEngine {
    constructor(repo) {
        this.repo = repo;
    }
    async process(event) {
        const handlers = index_1.operationalRegistry[event.type] ?? [];
        for (const handler of handlers) {
            const projectionId = handler.aggregateResolver?.(event)
                ?? event.aggregateId;
            const current = await this.repo.load(handler.projection, projectionId);
            const next = handler.reducer.reduce(current, event);
            await this.repo.save(handler.projection, projectionId, next);
        }
    }
}
exports.OperationalProjectionEngine = OperationalProjectionEngine;
