import { Business, DomainEvent } from "@business/shared-types";
import { ProjectionReducer } from "../contracts/ProjectionReducer";
interface BusinessPayload {
    id: string;
    name: string;
    address: string;
}
export declare class BusinessReducer implements ProjectionReducer<DomainEvent> {
    reduce(event: DomainEvent<BusinessPayload>): Business | {
        activatedAt: number;
        status: string;
        isOnboarding: boolean;
        onboardingCompleted: boolean;
    } | undefined;
    private created;
    private activate;
}
export {};
