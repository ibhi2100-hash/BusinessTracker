"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultProjectionEngine = void 0;
class DefaultProjectionEngine {
    constructor(registry, repository) {
        this.registry = registry;
        this.repository = repository;
    }
    async process(event) {
        const handlers = this.registry.handlers(event);
        for (const handler of handlers) {
            const id = handler.projectionId(event);
            const current = await this.repository.load(handler.projection, id);
            const next = handler.reducer.reduce(current, event);
            await this.repository.save(handler.projection, id, next);
        }
    }
}
exports.DefaultProjectionEngine = DefaultProjectionEngine;
