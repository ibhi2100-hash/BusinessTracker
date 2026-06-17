"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryEngine = void 0;
class RetryEngine {
    constructor(repository, retryPolicy) {
        this.repository = repository;
        this.retryPolicy = retryPolicy;
    }
    async schedule(event, reason) {
        const retryCount = (event.retryCount ?? 0) + 1;
        if (!this.retryPolicy.shouldRetry(retryCount)) {
            await this.repository.markDead(event.id, reason ?? "Retry limit exceeded");
            return;
        }
        const nextRetryAt = this.retryPolicy.nextDelay(retryCount);
        await this.repository.markFailed(event.id, reason ?? "", retryCount, nextRetryAt);
    }
    async reset(eventId) {
        await this.repository.resetForRetry(eventId);
    }
    async readyForRetry() {
        return this.repository.getRetryableEvents(Date.now());
    }
}
exports.RetryEngine = RetryEngine;
