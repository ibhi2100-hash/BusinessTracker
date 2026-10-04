import type { AggregateType } from "../../../../../offline/domain/aggregate";

export interface BranchCreationRequest {
    id: string;
    businessId: string;
    name: string;
    address?: string;
    phone?: string;

}
export interface BranchPayload {
    id: string;
    name: string;
    address?: string;
    phone?: string;
}

export interface SwitchBranchRequest {
    aggregateType: AggregateType;
    aggregateId: string;
    type: string;
    mode: "OPENING" | "LIVE";
    payload: BranchPayload;
}