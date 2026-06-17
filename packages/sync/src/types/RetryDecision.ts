import { SyncFailure } from "../types/SyncFailure";

export interface RetryDecision {
  retry: boolean;
  delayMs?: number;
}