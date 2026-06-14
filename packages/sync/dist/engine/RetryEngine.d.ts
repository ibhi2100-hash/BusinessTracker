import { SyncRepository } from "../contracts/SyncRepository";
export declare class RetryEngine {
    private repo;
    constructor(repo: SyncRepository);
    execute(): Promise<void>;
}
