import { SnapshotPolicy, SnapshotContext } from "../types/types";
export class TimeBasedPolicy implements SnapshotPolicy {

  constructor(
    private readonly intervalMs: number
  ) {}

  shouldSnapshot(context: SnapshotContext): boolean {

    if (!context.lastSnapshotAt) return true;

    return (
      context.now.getTime() -
      context.lastSnapshotAt.getTime()
    ) >= this.intervalMs;
  }
}