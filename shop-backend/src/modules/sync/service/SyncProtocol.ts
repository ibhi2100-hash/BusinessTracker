import { BackendEvent } from "../repositories/eventRepository.js";

export type PushEventStatus =
    | "ACCEPTED"
    | "ALREADY_ACCEPTED"
    | "CONFLICT"
    | "REJECTED";

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

    serverEvents: BackendEvent[];

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