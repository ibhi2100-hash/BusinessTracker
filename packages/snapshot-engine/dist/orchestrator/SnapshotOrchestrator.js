"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotOrchestrator = void 0;
class SnapshotOrchestrator {
    constructor(registry) {
        this.registry = registry;
    }
    async process(db, event, ledgerEntries) {
        const projectors = this.registry.get(event.type);
        for (const projector of projectors) {
            await projector.project(db, event, ledgerEntries);
        }
    }
}
exports.SnapshotOrchestrator = SnapshotOrchestrator;
