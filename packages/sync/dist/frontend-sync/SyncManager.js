"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncManager = void 0;
class SyncManager {
    constructor(engine) {
        this.engine = engine;
        this.syncing = false;
    }
    async sync() {
        if (this.syncing)
            return;
        this.syncing = true;
        try {
            await this.engine.sync();
        }
        finally {
            this.syncing = false;
        }
    }
}
exports.SyncManager = SyncManager;
