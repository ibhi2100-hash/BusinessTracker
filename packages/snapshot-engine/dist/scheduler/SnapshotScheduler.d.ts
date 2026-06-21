import { EventBus, EventSubscriber } from "@business/event-bus";
import { IntegrationEvent } from "@business/shared-types";
import { SnapshotEngine } from "../engine/SnapshotEngine";
import { SnapshotPolicyRegistry } from "../policies/defaultAggregatePolicies";
import { SnapshotMetadataRepo } from "../contracts/SnapshotMetaRepo";
export declare class SnapshotScheduler implements EventSubscriber<IntegrationEvent> {
    private readonly policyRegistry;
    private readonly snapshotEngine;
    private readonly metadataRepo;
    constructor(policyRegistry: SnapshotPolicyRegistry, snapshotEngine: SnapshotEngine, metadataRepo: SnapshotMetadataRepo);
    handle(events: IntegrationEvent[]): Promise<void>;
    register(bus: EventBus<IntegrationEvent>): void;
}
