import { SyncEngine } from "../engine/SyncEngine";
export declare class SyncManager {
    private engine;
    private syncing;
    constructor(engine: SyncEngine);
    sync(): Promise<void>;
}
