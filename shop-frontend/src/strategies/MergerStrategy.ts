import { BaseEvent } from "@business/shared-types";
import { SyncConflict, ConflictResolution } from "@business/sync";

export interface MergeStrategy {

  resolve(
    conflict: SyncConflict,
    serverEvents: BaseEvent[],
    pendingEvents: BaseEvent[]
  ): Promise<ConflictResolution>;

}