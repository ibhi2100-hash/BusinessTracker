"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailureService = void 0;
const calculateRetryDelay_1 = require("../helpers/calculateRetryDelay");
class FailureService {
    constructor(repository, maxRetry) {
        this.repository = repository;
        this.maxRetry = maxRetry;
    }
    async failEvent(event, error) {
        const retryCount = (event.retryCount ?? 0) + 1;
        const dead = retryCount >=
            this.maxRetry;
        if (dead) {
            await this.repository
                .markDead(event.id, error);
            return;
        }
        const delay = (0, calculateRetryDelay_1.calculateRetryDelay)(retryCount);
        await this.repository
            .markFailed(event.id, error, retryCount, Date.now() + delay);
    }
}
exports.FailureService = FailureService;
