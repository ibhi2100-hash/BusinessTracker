import { BaseEvent } from "@business/shared-types";
import { SyncRepository } from "../contracts/SyncRepository";
import { SyncErrorCode } from "../types/SyncError";
export declare class FailureService {
    private repository;
    private maxRetry;
    constructor(repository: SyncRepository, maxRetry: number);
    failEvent(event: BaseEvent, error: SyncErrorCode): Promise<void>;
}
