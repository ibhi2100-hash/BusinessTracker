"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEngine = void 0;
const RetryEngine_1 = require("./RetryEngine");
const SyncService_1 = require("../services/SyncService");
const FailureService_1 = require("../services/FailureService");
const AggragateSyncService_1 = require("../services/AggragateSyncService");
class SyncEngine {
    constructor(config) {
        this.config = config;
        this.running = false;
        const failureService = new FailureService_1.FailureService(config.repository, config.maxRetry);
        const aggregateSync = new AggragateSyncService_1.AggregateSyncService(config.repository, config.transport);
        this.retryEngine =
            new RetryEngine_1.RetryEngine(config.repository);
        this.syncService =
            new SyncService_1.SyncService(config.repository, aggregateSync, failureService, config.conflictResolver);
    }
    async sync() {
        if (this.running) {
            return;
        }
        if (!this.config
            .connectivity
            .isOnline()) {
            return;
        }
        this.running = true;
        try {
            await this.retryEngine
                .execute();
            await this.syncService
                .execute();
        }
        finally {
            this.running = false;
        }
    }
}
exports.SyncEngine = SyncEngine;
