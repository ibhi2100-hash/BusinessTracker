import { BaseEvent } from "@business/shared-types";
import { SnapshotEngine } from "@business/snapshot-engine";


export class Dispatcher {
  constructor(
    private snapshotEngine: SnapshotEngine
  ) {}

  async dispatch(event: BaseEvent) {
    await this.snapshotEngine.process(event);
  }
}