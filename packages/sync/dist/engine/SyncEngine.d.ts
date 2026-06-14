import { SyncConfig } from "../types/SyncConfig";
export declare class SyncEngine {
    private config;
    private retryEngine;
    private syncService;
    private running;
    constructor(config: SyncConfig);
    sync(): Promise<void>;
}
