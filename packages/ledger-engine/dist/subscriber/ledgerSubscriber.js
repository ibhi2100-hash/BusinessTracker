"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerSubscriber = void 0;
class LedgerSubscriber {
    constructor(ledgerEngine) {
        this.ledgerEngine = ledgerEngine;
    }
    async handle(events) {
        for (const event of events) {
            await this.ledgerEngine.process(event);
        }
    }
}
exports.LedgerSubscriber = LedgerSubscriber;
