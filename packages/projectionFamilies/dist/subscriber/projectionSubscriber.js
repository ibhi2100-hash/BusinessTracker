"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectionSubscriber = void 0;
class ProjectionSubscriber {
    constructor(projecionEngine) {
        this.projecionEngine = projecionEngine;
    }
    async handle(events) {
        for (const event of events) {
            await this.projecionEngine.process(event);
        }
    }
}
exports.ProjectionSubscriber = ProjectionSubscriber;
