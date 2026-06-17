import { BaseEvent } from "@business/shared-types";
import { RetryPolicy } from "../contracts/RetryPolicy";
import { SyncRepository } from "../contracts/SyncRepository";
export declare class RetryEngine {
    private repository;
    private retryPolicy;
    constructor(repository: SyncRepository, retryPolicy: RetryPolicy);
    schedule(event: BaseEvent, reason?: string): Promise<void>;
    reset(eventId: string): Promise<void>;
    readyForRetry(): Promise<BaseEvent[]>;
}
