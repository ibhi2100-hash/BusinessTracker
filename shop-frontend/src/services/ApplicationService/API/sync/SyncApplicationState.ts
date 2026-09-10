import {
    SyncResult,
} from "@/src/offline/sqlite/businessDatabase/sync/syncEngine";

export type SyncApplicationStatus =
    | "SYNCED"
    | "SYNCING"
    | "CONFLICT"
    | "ERROR";

export interface SyncApplicationState {

    status:
        SyncApplicationStatus;

    pendingEvents:
        number;

    uploadedEvents:
        number;

    activities: any[];

    acceptedEvents:
        number;

    rejectedEvents:
        number;

    conflictEvents:
        number;

    deviceCursor: number;

    lastPulledGlobalPosition:
        number;

    lastSyncAt:
        number | null;

    lastSyncDurationMs:
        number | null;

    lastResult:
        SyncResult | null;

    conflicts:
        SyncResult extends infer T
            ? T extends {
                kind: "conflict";
                conflicts: infer C;
            }
                ? C
                : never
            : never[];

    error:
        string | null;
}