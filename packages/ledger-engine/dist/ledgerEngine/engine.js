"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerEngine = void 0;
class LedgerEngine {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async process(event) {
        console.log("Ledger Start");
        // 1. IDEMPOTENCY CHECK
        const exists = await this.ctx.eventStore.exists(event.id);
        if (exists)
            return;
        console.log("Exists?", exists);
        console.log("continue");
        // 2. PERSIST EVENT
        await this.ctx.eventStore.append(event);
        // 3. GENERATE LEDGER ENTRIES (deterministic)
        const entries = this.ctx.ledgerGenerator(event);
        // 4. SNAPSHOT UPDATE (state compression)
        await this.ctx.snapshotEngine.process(event);
        // 5. PROJECTIONS (read models)
        await this.ctx.projectionEngine.process(event, entries);
        // 6. VERSION / AGGREGATE STATE TRACKING
        await this.ctx.versionManager.update(event);
    }
}
exports.LedgerEngine = LedgerEngine;
