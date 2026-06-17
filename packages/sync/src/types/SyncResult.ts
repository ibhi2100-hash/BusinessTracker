import { AggregateState } from "./AggregateState";
import { SyncConflict } from "./SyncConflict";
import { SyncFailure } from "./SyncFailure";
import { SyncSuccess } from "./SyncSuccess";

export interface SyncResult {

  success: SyncSuccess[];

  failed: SyncFailure[];

  conflicts: SyncConflict[];

  serverState?: AggregateState;

}