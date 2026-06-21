import { SnapshotPolicy } from "../types/types";
export type AggregateType = "BUSINESS" | "PRODUCT" | "INVENTORY" | "DASHBOARD" | "LEDGER";
export declare class SnapshotPolicyRegistry {
    private readonly policies;
    constructor();
    get(type: AggregateType): SnapshotPolicy | undefined;
}
