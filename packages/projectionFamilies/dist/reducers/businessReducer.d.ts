import { Business, DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface BusinessPayload {
    id: string;
    name: string;
    address: string;
}
export declare class BusinessReducer implements ProjectionReducer<Business, DomainEvent> {
    reduce(state: Business | null, event: DomainEvent<BusinessPayload>): Business;
    private created;
    private activate;
}
export {};
