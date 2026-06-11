"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerEngine = void 0;
class LedgerEngine {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async process(event) {
        try {
            console.log("1 exists");
            const exists = await this.ctx.eventStore.exists(event.id);
            console.log("1 done");
            if (exists)
                return;
            console.log("2 append");
            await this.ctx.eventStore.append(event);
            console.log("2 done");
            console.log("3 ledger");
            const entries = this.ctx.ledgerGenerator(event);
            console.log("3 done");
            console.log("4 snapshot");
            await this.ctx.snapshotEngine.process(event);
            console.log("4 done");
            console.log("5 projections");
            await this.ctx.projectionEngine.process(event, entries);
            console.log("5 done");
            console.log("6 version");
            await this.ctx.versionManager.update(event);
            console.log("6 done");
        }
        catch (e) {
            console.error("FAILED INSIDE LEDGER", e);
            throw e;
        }
    }
}
exports.LedgerEngine = LedgerEngine;
