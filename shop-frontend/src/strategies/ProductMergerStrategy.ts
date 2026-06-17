import { MergeStrategy } from "./MergerStrategy";
import { BaseEvent } from "@business/shared-types";
import { SyncConflict, ConflictResolution } from "@business/sync";
import { ResolutionType } from "@business/sync";

export class ProductMergeStrategy implements MergeStrategy {

  async resolve(
    conflict: SyncConflict,
    serverEvents: BaseEvent[],
    pendingEvents: BaseEvent[]
  ): Promise<ConflictResolution> {

    // simple strategy: server wins if version mismatch is large
    const serverVersion = conflict.serverVersion;
    const localVersion = conflict.localVersion;

    // CASE 1: trivial fast-forward (safe replay)
    if (localVersion < serverVersion) {

      return {
        type: ResolutionType.RESOLVED,

        events: pendingEvents.map(e => ({
          ...e,
          aggregateVersion: serverVersion + 1
        })) as BaseEvent[],

        reason: "Auto fast-forward after conflict"
      };
    }

    // CASE 2: unknown overlap → manual
    return {
      type: ResolutionType.MANUAL,
      events: [],
      reason: "Manual resolution required for product conflict"
    };
  }
}