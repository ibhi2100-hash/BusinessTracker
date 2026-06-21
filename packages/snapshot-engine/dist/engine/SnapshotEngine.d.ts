import { SnapshotRepo } from "../contracts/SnapshotRepo";
import { SnapshotRegistry } from "../contracts/SnapshotRegistry";
export interface SnapshotEngineContext {
    eventStore: {
        after(aggregateId: string, version: number): Promise<any[]>;
    };
}
export declare class SnapshotEngine {
    private repo;
    private registry;
    private ctx;
    constructor(repo: SnapshotRepo, registry: SnapshotRegistry, ctx: SnapshotEngineContext);
    build(aggregateId: string, aggregateType: string): Promise<void>;
    private buildSnapshotKey;
}
