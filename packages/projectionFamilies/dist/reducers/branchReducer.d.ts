import { DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface BranchPayload {
    id: string;
    name: string;
    address: string;
    phone: string;
}
export declare class BranchReducer implements ProjectionReducer<DomainEvent<BranchPayload>> {
    reduce(event: DomainEvent<BranchPayload>): {
        id: string;
        name: string;
        phone: string;
        businessId: string | undefined;
        isActive: boolean;
        isDefault: boolean;
        createdAt: number;
    } | undefined;
}
export {};
