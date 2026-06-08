import { BaseEvent } from "@business/shared-types";
export declare class SnapshotEngine {
    private repo;
    process(aggregateId: string, reducer: any, event: BaseEvent): Promise<void>;
}
