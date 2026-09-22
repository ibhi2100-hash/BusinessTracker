// hooks/useLiveSyncManagement.ts

import { useCallback } from "react";

import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

import { useLiveQuery } from "./useLiveQuery";

import { PersistedSyncState } from "@business/shared-types";

const SYNC_DEPENDENCIES = [
    "sync_state",
    "sync_activities",
    "conflicts",
    "outbox",
] as const;

export function useLiveSyncManagement() {

    const app = useApplication();

    const query = useCallback(async (): Promise<PersistedSyncState> => {

        return app.syncService.getState();

    }, [app]);

    return useLiveQuery<PersistedSyncState>(
        [
            "sync_state",
            "sync_activities",
            "conflicts",
            "outbox",
        ],
        query,
        {
            status: "SYNCED",

            pendingEvents: 0,

            uploadedEvents: 0,

            alreadyAcceptedEvents: 0,

            pulledEvents: 0,

            acceptedEvents: 0,

            rejectedEvents: 0,

            conflictEvents: 0,

            deviceCursor: 0,

            lastPulledGlobalPosition: 0,

            lastSyncAt: null,

            lastSyncDurationMs: null,

            lastResult: null,

            activities: [],

            conflicts: [],

            error: null,
        }
    );
}