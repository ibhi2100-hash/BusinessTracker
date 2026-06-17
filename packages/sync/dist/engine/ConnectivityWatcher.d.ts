import { SyncEngine } from "./SyncEngine";
export declare class ConnectivityWatcher {
    private engine;
    constructor(engine: SyncEngine);
    start(): void;
    stop(): void;
}
