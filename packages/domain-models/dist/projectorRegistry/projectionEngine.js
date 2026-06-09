"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionEngine = void 0;
const projectorRegistry_1 = require("./projectorRegistry");
class ProjectionEngine {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async process(event) {
        const projectors = projectorRegistry_1.projectorRegistry[event.type] ?? [];
        for (const projector of projectors) {
            const current = await this.repo.load(projector.projection, event.aggregateId);
            const next = projector.reducer.reduce(current, event);
            await this.repo.save(projector.projection, next);
        }
    }
}
exports.ProjectionEngine = ProjectionEngine;
