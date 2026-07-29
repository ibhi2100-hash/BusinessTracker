import { DomainEvent } from "@business/shared-types";
import { ProjectionRegistry } from "../contracts/ProjectionRegistry";
export declare class DefaultProjectionRegistry implements ProjectionRegistry<DomainEvent> {
    private readonly map;
}
