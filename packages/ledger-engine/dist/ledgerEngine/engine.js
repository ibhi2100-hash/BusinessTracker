"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerEngine = void 0;
class LedgerEngine {
    constructor(ctx) {
        this.ctx = ctx;
    }
    async process(event) {
        try {
            // 2. Generate ledger entries
            const entries = this.ctx.ledgerGenerator(event);
            // 3. Persist ledger entries ONLY
            await this.ctx.ledgerRepository.append(entries);
        }
        catch (e) {
            console.error("LEDGER_ENGINE_FAILED", {
                eventId: event.id,
                error: e
            });
            throw e;
        }
    }
}
exports.LedgerEngine = LedgerEngine;
