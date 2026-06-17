import { BaseEvent } from "@business/shared-types";

export enum ResolutionType {

    RESOLVED = "RESOLVED",

    MANUAL = "MANUAL",

    REJECTED = "REJECTED"

}

export interface ConflictResolution {

    type: ResolutionType;

    events: BaseEvent[];

    reason?: string;

}