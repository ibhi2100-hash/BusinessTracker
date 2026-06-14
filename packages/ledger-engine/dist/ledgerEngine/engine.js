"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerEngine = void 0;
class LedgerEngine {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async process(event) {
        try {
            const exists = await this.ctx.eventStore.exists(event.id);
            if (exists)
                return;
            await this.ctx.eventStore.append(event);
            const entries = this.ctx.ledgerGenerator(event);
            await this.ctx.ledgerRepository.append(entries);
            await this.ctx.snapshotEngine.process(event);
            await this.ctx.projectionEngine.process(event);
            await this.ctx.versionManager.update(event);
        }
        catch (e) {
            console.error("FAILED INSIDE LEDGER", e);
            throw e;
        }
    }
}
exports.LedgerEngine = LedgerEngine;
