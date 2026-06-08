import { BaseEvent } from "@business/shared-types";
import { SnapshotRepo } from "../contracts/SnapshotRepo";
import { SnapshotRegistry } from "../contracts/SnapshotRegistry";
export declare class SnapshotEngine {
    private repo;
    private registry;
    constructor(repo: SnapshotRepo, registry: SnapshotRegistry);
    process(event: BaseEvent): Promise<void>;
    private buildSnapshotKey;
}
