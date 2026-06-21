import { SnapshotPolicy, SnapshotContext } from "../types/types";

export class CompositeSnapshotPolicy implements SnapshotPolicy {

  constructor(
    private readonly policies: SnapshotPolicy[]
  ) {}

  shouldSnapshot(context: SnapshotContext): boolean {
    return this.policies.some(p => p.shouldSnapshot(context));
  }
}