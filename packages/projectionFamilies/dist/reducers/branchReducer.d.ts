import { Branch } from "@business/shared-types";
import { DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface BranchPayload {
    id: string;
    name: string;
    address: string;
    phone: string;
}
export declare class BranchReducer implements ProjectionReducer<Branch, DomainEvent<BranchPayload>> {
    reduce(state: Branch, event: DomainEvent<BranchPayload>): Branch;
}
export {};
