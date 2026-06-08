import { Snapshot } from "@business/shared-types";
export interface SnapshotRepo {
    get(aggregateId: string): Promise<Snapshot | null>;
    save(snapshot: Snapshot): Promise<void>;
}
