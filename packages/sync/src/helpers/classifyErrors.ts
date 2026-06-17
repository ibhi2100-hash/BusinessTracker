import { SyncErrorCode } from "../types/SyncError";
export function classifyError(message: string): SyncErrorCode {

  if (message.includes("validation")) {
    return SyncErrorCode.VALIDATION;
  }

  if (message.includes("duplicate")) {
    return SyncErrorCode.DUPLICATE_EVENT;
  }

  if (message.includes("not found")) {
    return SyncErrorCode.AGGREGATE_NOT_FOUND;
  }

  if (message.includes("rule")) {
    return SyncErrorCode.BUSINESS_RULE;
  }

  return SyncErrorCode.UNKNOWN;
}