"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryEngine = void 0;
class RetryEngine {
    constructor(repo) {
        this.repo = repo;
    }
    async execute() {
        const now = Date.now();
        const retryable = await this.repo
            .getRetryableEvents(now);
        for (const event of retryable) {
            await this.repo
                .resetForRetry(event.id);
        }
    }
}
exports.RetryEngine = RetryEngine;
