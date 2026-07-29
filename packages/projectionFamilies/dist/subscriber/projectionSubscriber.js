"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionSubscriber = void 0;
class ProjectionSubscriber {
    constructor(engine) {
        this.engine = engine;
    }
    async handle(events) {
        for (const event of events) {
            await this.engine.process(event);
        }
    }
}
exports.ProjectionSubscriber = ProjectionSubscriber;
