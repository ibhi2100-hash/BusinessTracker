import { SnapshotPolicy } from "../types/types";
export declare class SnapshotPolicyRegistry {
    private readonly policies;
    register(aggregateType: string, policy: SnapshotPolicy): void;
    get(aggregateType: string): SnapshotPolicy | undefined;
}
