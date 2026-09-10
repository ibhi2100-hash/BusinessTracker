import { BackendEvent } from "@business/shared-types";
import { BackendEventPayload } from "./types";

export interface PushEventsRequest {
    events: BackendEventPayload[];
}

export interface AcceptedEventResult {
    eventId: string;

    aggregateId: string;
    aggregateType: string;

    aggregateVersion: number;
    globalPosition: number;

    status:
        | "ACCEPTED"
        | "ALREADY_ACCEPTED";
}

export interface ConflictEventResult {
    eventId: string;

    aggregateId: string;
    aggregateType: string;

    expectedAggregateVersion: number;

    serverAggregateVersion: number;

    serverEvents: BackendEvent;

    status: "CONFLICT";
}

export interface RejectedEventResult {
    eventId: string;

    aggregateId: string;
    aggregateType: string;

    status: "REJECTED";

    reason: string;
}

export interface PushEventsResponse {
    accepted: AcceptedEventResult[];

    conflicts: ConflictEventResult[];

    rejected: RejectedEventResult[];

    summary: {
        total: number;
        accepted: number;
        alreadyAccepted: number;
        conflicts: number;
        rejected: number;
    };
}