import { BaseEvent } from "@business/shared-types";
export declare enum ResolutionType {
    RESOLVED = "RESOLVED",
    MANUAL = "MANUAL",
    REJECTED = "REJECTED"
}
export interface ConflictResolution {
    type: ResolutionType;
    events: BaseEvent[];
    reason?: string;
}
