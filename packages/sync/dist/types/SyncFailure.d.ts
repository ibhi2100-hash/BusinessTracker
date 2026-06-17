import { SyncErrorCode } from "./SyncError";
export interface SyncFailure {
    eventId: string;
    code: SyncErrorCode;
    message: string;
    retryable: boolean;
}
