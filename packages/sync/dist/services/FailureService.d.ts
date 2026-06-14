import { SyncRepository } from "../contracts/SyncRepository";
export declare class FailureService {
    private repository;
    private maxRetry;
    constructor(repository: SyncRepository, maxRetry: number);
    failEvent(event: any, error: string): Promise<void>;
}
