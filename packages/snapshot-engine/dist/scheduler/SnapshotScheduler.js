"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotScheduler = void 0;
const groupByAggregate_1 = require("../helpers/groupByAggregate");
class SnapshotScheduler {
    constructor(policyRegistry, snapshotEngine, metadataRepo) {
        this.policyRegistry = policyRegistry;
        this.snapshotEngine = snapshotEngine;
        this.metadataRepo = metadataRepo;
    }
    async handle(events) {
        if (!events.length)
            return;
        // 1. Group events by aggregate
        const grouped = (0, groupByAggregate_1.groupByAggregate)(events);
        // 2. Process each aggregate independently
        for (const [aggregateKey] of grouped) {
            try {
                // 3. Load snapshot + version metadata
                const meta = await this.metadataRepo.get(aggregateKey);
                if (!meta)
                    continue;
                // 4. Get policy for aggregate type
                const policy = this.policyRegistry.get(meta.aggregateType);
                if (!policy)
                    continue;
                // 5. Build snapshot decision context
                const context = {
                    aggregateId: meta.aggregateId,
                    aggregateType: meta.aggregateType,
                    version: meta.currentVersion,
                    eventCountSinceSnapshot: meta.eventCountSinceSnapshot,
                    lastSnapshotAt: meta.lastSnapshotAt,
                    now: new Date()
                };
                // 6. Policy evaluation (guarded)
                const shouldSnapshot = policy.shouldSnapshot(context);
                if (!shouldSnapshot)
                    continue;
                // 7. Execute snapshot rebuild
                await this.snapshotEngine.build(meta.aggregateId, meta.aggregateType);
            }
            catch (error) {
                // IMPORTANT: scheduler must never break event pipeline
                console.error("SNAPSHOT_SCHEDULER_FAILED", {
                    aggregateKey,
                    error
                });
                continue;
            }
        }
    }
    register(bus) {
        // subscribe the whole subscriber instance (implements EventSubscriber)
        bus.subscribe(this);
    }
}
exports.SnapshotScheduler = SnapshotScheduler;
