import { SnapshotPolicy, SnapshotContext } from "../types/types";

export class EveryNEventsPolicy implements SnapshotPolicy {

  constructor(
    private readonly threshold: number
  ) {}

  shouldSnapshot(context: SnapshotContext): boolean {
    return context.eventCountSinceSnapshot >= this.threshold;
  }
}