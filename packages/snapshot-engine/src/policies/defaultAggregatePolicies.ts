import { SnapshotPolicy } from "../types/types";
import { CompositeSnapshotPolicy } from "./CompositePolicies";
import { EveryNEventsPolicy } from "./NEventsPolicy";
import { TimeBasedPolicy } from "./TimeBasedPolicy";

export type AggregateType =
  | "BUSINESS"
  | "PRODUCT"
  | "INVENTORY"
  | "DASHBOARD"
  | "LEDGER";

export class SnapshotPolicyRegistry {

  private readonly policies =
    new Map<AggregateType, SnapshotPolicy>();

  constructor() {

    // BUSINESS (slow-changing root aggregate)
    this.policies.set(
      "BUSINESS",
      new CompositeSnapshotPolicy([
        new EveryNEventsPolicy(20),
        new TimeBasedPolicy(60 * 60 * 1000) // 1 hour
      ])
    );

    // PRODUCT (medium churn)
    this.policies.set(
      "PRODUCT",
      new CompositeSnapshotPolicy([
        new EveryNEventsPolicy(30),
        new TimeBasedPolicy(10 * 60 * 1000) // 10 min
      ])
    );

    // INVENTORY (high churn, critical consistency)
    this.policies.set(
      "INVENTORY",
      new CompositeSnapshotPolicy([
        new EveryNEventsPolicy(10),
        new TimeBasedPolicy(2 * 60 * 1000) // 2 min
      ])
    );

    // DASHBOARD (very high churn derived data)
    this.policies.set(
      "DASHBOARD",
      new EveryNEventsPolicy(5)
    );

    // LEDGER (financial safety-critical)
    this.policies.set(
      "LEDGER",
      new CompositeSnapshotPolicy([
        new EveryNEventsPolicy(5),
        new TimeBasedPolicy(30 * 1000) // 30 sec
      ])
    );
  }

  get(
    type: AggregateType
  ): SnapshotPolicy | undefined {
    return this.policies.get(type);
  }
}