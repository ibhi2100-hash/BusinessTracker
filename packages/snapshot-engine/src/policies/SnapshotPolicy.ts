import { SnapshotPolicy } from "../types/types";

export class SnapshotPolicyRegistry {

  private readonly policies =
    new Map<string, SnapshotPolicy>();

  register(
    aggregateType: string,
    policy: SnapshotPolicy
  ) {
    this.policies.set(aggregateType, policy);
  }

  get(
    aggregateType: string
  ): SnapshotPolicy | undefined {
    return this.policies.get(aggregateType);
  }
}