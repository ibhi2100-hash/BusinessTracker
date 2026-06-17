import { SyncConflict } from "../types/SyncConflict";

export interface ConflictResolutionResult {
  resolved: boolean;
  action: "SERVER_WINS" | "CLIENT_WINS" | "MERGE_REQUIRED" | "QUEUE_MANUAL";
}