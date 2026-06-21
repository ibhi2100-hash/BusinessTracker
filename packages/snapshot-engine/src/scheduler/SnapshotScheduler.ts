import { EventBus, EventSubscriber } from "@business/event-bus";
import { IntegrationEvent } from "@business/shared-types";

import { SnapshotEngine } from "../engine/SnapshotEngine";
import { groupByAggregate } from "../helpers/groupByAggregate";
import { SnapshotPolicyRegistry } from "../policies/defaultAggregatePolicies";
import { SnapshotMetadataRepo } from "../contracts/SnapshotMetaRepo";

import { SnapshotContext } from "../types/types";

export class SnapshotScheduler implements EventSubscriber<IntegrationEvent> {

  constructor(
    private readonly policyRegistry: SnapshotPolicyRegistry,
    private readonly snapshotEngine: SnapshotEngine,
    private readonly metadataRepo: SnapshotMetadataRepo
  ) {}

  async handle(events: IntegrationEvent[]) {

    if (!events.length) return;

    // 1. Group events by aggregate
    const grouped = groupByAggregate(events);

    // 2. Process each aggregate independently
    for (const [aggregateKey] of grouped) {

      try {

        // 3. Load snapshot + version metadata
        const meta =
          await this.metadataRepo.get(aggregateKey);

        if (!meta) continue;

        // 4. Get policy for aggregate type
        const policy =
          this.policyRegistry.get(meta.aggregateType as any);

        if (!policy) continue;

        // 5. Build snapshot decision context
        const context: SnapshotContext = {
          aggregateId: meta.aggregateId,
          aggregateType: meta.aggregateType,

          version: meta.currentVersion,

          eventCountSinceSnapshot:
            meta.eventCountSinceSnapshot,

          lastSnapshotAt:
            meta.lastSnapshotAt,

          now: new Date()
        };

        // 6. Policy evaluation (guarded)
        const shouldSnapshot =
          policy.shouldSnapshot(context);

        if (!shouldSnapshot) continue;

        // 7. Execute snapshot rebuild
        await this.snapshotEngine.build(
          meta.aggregateId,
          meta.aggregateType
        );

      } catch (error) {

        // IMPORTANT: scheduler must never break event pipeline
        console.error(
          "SNAPSHOT_SCHEDULER_FAILED",
          {
            aggregateKey,
            error
          }
        );

        continue;
      }
    }
  }

  register(
    bus: EventBus<IntegrationEvent>
  ){
    // subscribe the whole subscriber instance (implements EventSubscriber)
    bus.subscribe(this);
  }
}