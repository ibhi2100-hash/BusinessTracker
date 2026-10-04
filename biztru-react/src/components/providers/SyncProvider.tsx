import type { ReactNode } from "react";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import type {
    PersistedSyncState,
    SyncResult,
    SyncTrigger,
} from "@business/shared-types";

import {
    SyncApplicationService,
} from "../../Biztru/services/ApplicationService/API/sync/SyncApplicationService";

import type {
    SyncApplicationEvent,
} from "../../Biztru/services/ApplicationService/API/sync/SyncApplicationService";

import {
    useLiveSyncManagement,
} from "../../hooks/useLiveSyncManagement";


/*
 * ============================================================
 * Default synchronization state
 * ============================================================
 *
 * Used while the durable synchronization state is being
 * restored from the local database.
 *
 * This keeps the React-facing contract total:
 *
 * PersistedSyncState
 *       ↓
 * SyncContextValue
 *
 * No required context property becomes undefined while the
 * live query is loading.
 */

const DEFAULT_SYNC_STATE: PersistedSyncState = {
    status: "IDLE",

    pendingEvents: 0,

    uploadedEvents: 0,

    acceptedEvents: 0,

    alreadyAcceptedEvents: 0,

    rejectedEvents: 0,

    conflictEvents: 0,

    pulledEvents: 0,

    lastPulledGlobalPosition: 0,

    deviceCursor: 0,

    lastSyncAt: null,

    lastSyncDurationMs: null,

    lastResult: null,

    conflicts: [],

    activities: [],

    error: null,
};

/*
 * ============================================================
 * Context contract
 * ============================================================
 */

export interface SyncContextValue {

    status:
        PersistedSyncState["status"];

    isSyncing:
        boolean;

    isOnline:
        boolean;

    pendingEvents:
        number;

    uploadedEvents:
        number;

    acceptedEvents:
        number;

    rejectedEvents:
        number;

    conflictEvents:
        number;

    lastPulledGlobalPosition:
        number;

    lastSyncAt:
        number | null;

    lastSyncDurationMs:
        number | null;

    lastResult:
        SyncResult | null;

    conflicts:
        PersistedSyncState["conflicts"];

    error:
        string | null;

    syncNow:
        () => Promise<SyncResult>;
}


const SyncContext =
    createContext<SyncContextValue | null>(
        null
    );


/*
 * ============================================================
 * Provider props
 * ============================================================
 */

interface SyncProviderProps {

    children:
        ReactNode;

    syncService:
        SyncApplicationService;
}


/*
 * ============================================================
 * Toast configuration
 * ============================================================
 */

const SYNC_TOAST_ID =
    "business-sync";


/*
 * ============================================================
 * Provider
 * ============================================================
 */

export function SyncProvider({
    children,
    syncService,
}: SyncProviderProps) {

    const navigate =
        useNavigate();


    /*
     * ========================================================
     * Durable synchronization state
     * ========================================================
     *
     * The local synchronization state is restored through
     * useLiveSyncManagement().
     *
     * The hook may temporarily return undefined while the
     * durable state is being loaded.
     *
     * React receives the canonical default state during that
     * short initialization period.
     */

    const {
        data: syncState,
    } =
        useLiveSyncManagement();


    const currentSyncState =
        syncState ??
        DEFAULT_SYNC_STATE;


    /*
     * ========================================================
     * Browser connectivity
     * ========================================================
     *
     * Browser connectivity is deliberately separate from
     * application synchronization state.
     *
     * Going offline does not mutate the durable sync state.
     */

    const [
        isOnline,
        setIsOnline,
    ] =
        useState<boolean>(
            () =>
                typeof navigator === "undefined"
                    ? true
                    : navigator.onLine
        );


    useEffect(() => {

        const handleOnline =
            (): void => {

                setIsOnline(
                    true
                );
            };


        const handleOffline =
            (): void => {

                setIsOnline(
                    false
                );


                toast.warning(
                    "You're offline",
                    {
                        id:
                            SYNC_TOAST_ID,

                        description:
                            "Changes will remain on this device and synchronize when the connection returns.",

                        duration:
                            8_000,

                        action: {

                            label:
                                "View sync",

                            onClick:
                                () =>
                                    navigate(
                                        "/sync-management"
                                    ),
                        },
                    }
                );
            };


        window.addEventListener(
            "online",
            handleOnline
        );

        window.addEventListener(
            "offline",
            handleOffline
        );


        return () => {

            window.removeEventListener(
                "online",
                handleOnline
            );

            window.removeEventListener(
                "offline",
                handleOffline
            );
        };

    }, [
        navigate,
    ]);


    /*
     * ========================================================
     * Manual synchronization command
     * ========================================================
     *
     * The provider does not implement synchronization logic.
     *
     * SyncApplicationService remains responsible for executing
     * synchronization.
     */

    const syncNow =
        useCallback(
            (): Promise<SyncResult> =>
                syncService.syncNow(),
            [
                syncService,
            ]
        );


    /*
     * ========================================================
     * Context value
     * ========================================================
     */

    const value =
        useMemo<SyncContextValue>(
            () => ({

                status:
                    currentSyncState.status,

                isSyncing:
                    currentSyncState.status ===
                    "SYNCING",

                isOnline,

                pendingEvents:
                    currentSyncState.pendingEvents,

                uploadedEvents:
                    currentSyncState.uploadedEvents,

                acceptedEvents:
                    currentSyncState.acceptedEvents,

                rejectedEvents:
                    currentSyncState.rejectedEvents,

                conflictEvents:
                    currentSyncState.conflictEvents,

                lastPulledGlobalPosition:
                    currentSyncState.lastPulledGlobalPosition,

                lastSyncAt:
                    currentSyncState.lastSyncAt,

                lastSyncDurationMs:
                    currentSyncState.lastSyncDurationMs,

                lastResult:
                    currentSyncState.lastResult,

                conflicts:
                    currentSyncState.conflicts,

                error:
                    currentSyncState.error,

                syncNow,

            }),
            [
                currentSyncState,
                isOnline,
                syncNow,
            ]
        );


    /*
     * ========================================================
     * Provider
     * ========================================================
     */

    return (

        <SyncContext.Provider
            value={value}
        >

            {children}

        </SyncContext.Provider>
    );
}


/*
 * ============================================================
 * Consumer hook
 * ============================================================
 */

export function useSync():
    SyncContextValue {

    const context =
        useContext(
            SyncContext
        );


    if (
        context === null
    ) {

        throw new Error(
            "useSync must be used inside SyncProvider."
        );
    }


    return context;
}


/*
 * ============================================================
 * Synchronization event presentation
 * ============================================================
 *
 * These functions translate application synchronization events
 * into user-facing notifications.
 *
 * They do not mutate synchronization state.
 */


/*
 * ============================================================
 * Event dispatcher
 * ============================================================
 */

export function handleSynchronizationEvent(
    event: SyncApplicationEvent
): void {

    switch (event.type) {

        case "STARTED":

            handleSyncStarted(
                event.trigger
            );

            return;


        case "COMPLETED":

            if (
                event.result !== null
            ) {

                handleSyncCompleted(
                    event.trigger,
                    event.result
                );
            }

            return;


        case "FAILED":

            handleSyncFailed(
                event.error
            );

            return;
    }
}


/*
 * ============================================================
 * Synchronization started
 * ============================================================
 */

function handleSyncStarted(
    trigger: SyncTrigger
): void {

    /*
     * Background interval synchronization remains silent.
     */

    if (
        trigger === "INTERVAL"
    ) {
        return;
    }


    toast.loading(
        getSyncingMessage(
            trigger
        ),
        {
            id:
                SYNC_TOAST_ID,

            description:
                "Sending local changes and checking for remote updates.",
        }
    );
}


/*
 * ============================================================
 * Synchronization completed
 * ============================================================
 */

function handleSyncCompleted(
    trigger: SyncTrigger,
    result: SyncResult
): void {

    const summary =
        summarizeResult(
            result
        );


    /*
     * --------------------------------------------------------
     * Conflicts
     * --------------------------------------------------------
     */

    if (
        summary.conflicts > 0
    ) {

        toast.warning(
            `${summary.conflicts} synchronization conflict${
                summary.conflicts === 1
                    ? ""
                    : "s"
            }`,
            {

                id:
                    SYNC_TOAST_ID,

                description:
                    "Some local changes conflict with newer server data and need your attention.",

                duration:
                    10_000,

                action: {

                    label:
                        "Resolve",

                    onClick:
                        () =>
                            window.location.assign(
                                "/sync-management"
                            ),
                },
            }
        );

        return;
    }


    /*
     * --------------------------------------------------------
     * Permanent rejection
     * --------------------------------------------------------
     */

    if (
        summary.rejected > 0
    ) {

        toast.error(
            `${summary.rejected} event${
                summary.rejected === 1
                    ? ""
                    : "s"
            } could not be synchronized`,
            {

                id:
                    SYNC_TOAST_ID,

                description:
                    "Open Sync Management to inspect the rejected events.",

                duration:
                    10_000,

                action: {

                    label:
                        "View",

                    onClick:
                        () =>
                            window.location.assign(
                                "/sync-management"
                            ),
                },
            }
        );

        return;
    }


    /*
     * --------------------------------------------------------
     * Transient error
     * --------------------------------------------------------
     */

    if (
        summary.transientError !== null
    ) {

        toast.error(
            "Synchronization interrupted",
            {

                id:
                    SYNC_TOAST_ID,

                description:
                    summary.transientError,

                duration:
                    10_000,

                action: {

                    label:
                        "View sync",

                    onClick:
                        () =>
                            window.location.assign(
                                "/sync-management"
                            ),
                },
            }
        );

        return;
    }


    /*
     * --------------------------------------------------------
     * Nothing changed
     * --------------------------------------------------------
     */

    if (
        summary.pushed === 0 &&
        summary.pulled === 0
    ) {

        toast.dismiss(
            SYNC_TOAST_ID
        );


        if (
            trigger === "MANUAL"
        ) {

            toast.success(
                "Everything is up to date"
            );
        }


        return;
    }


    /*
     * --------------------------------------------------------
     * Background synchronization
     * --------------------------------------------------------
     */

    if (
        trigger === "INTERVAL"
    ) {

        toast.dismiss(
            SYNC_TOAST_ID
        );

        return;
    }


    /*
     * --------------------------------------------------------
     * Useful synchronization
     * --------------------------------------------------------
     */

    toast.success(
        "Synchronization complete",
        {

            id:
                SYNC_TOAST_ID,

            description:
                buildSuccessDescription(
                    summary.pushed,
                    summary.pulled
                ),
        }
    );
}


/*
 * ============================================================
 * Synchronization failed
 * ============================================================
 */

function handleSyncFailed(
    error: string | null
): void {

    toast.error(
        "Synchronization failed",
        {

            id:
                SYNC_TOAST_ID,

            description:
                error ??
                "An unexpected synchronization error occurred.",

            duration:
                10_000,

            action: {

                label:
                    "View sync",

                onClick:
                    () =>
                        window.location.assign(
                            "/sync-management"
                        ),
            },
        }
    );
}


/*
 * ============================================================
 * Synchronization summary
 * ============================================================
 */

interface SyncSummary {

    pushed:
        number;

    pulled:
        number;

    accepted:
        number;

    rejected:
        number;

    conflicts:
        number;

    transientError:
        string | null;
}


function summarizeResult(
    result: SyncResult
): SyncSummary {

    switch (result.kind) {

        case "idle":

            return {

                pushed:
                    0,

                pulled:
                    result.pulled,

                accepted:
                    0,

                rejected:
                    0,

                conflicts:
                    0,

                transientError:
                    null,
            };


        case "synced":

            return {

                pushed:
                    result.pushed,

                pulled:
                    result.pulled,

                accepted:
                    result.pushed,

                rejected:
                    result.rejected.length,

                conflicts:
                    0,

                transientError:
                    null,
            };


        case "conflict":

            return {

                pushed:
                    result.accepted.length,

                pulled:
                    result.pulled,

                accepted:
                    result.accepted.length,

                rejected:
                    result.rejected.length,

                conflicts:
                    result.conflicts.length,

                transientError:
                    null,
            };


        case "rejected":

            return {

                pushed:
                    result.accepted.length,

                pulled:
                    result.pulled,

                accepted:
                    result.accepted.length,

                rejected:
                    result.rejected.length,

                conflicts:
                    0,

                transientError:
                    null,
            };


        case "transient":

            return {

                pushed:
                    0,

                pulled:
                    0,

                accepted:
                    0,

                rejected:
                    0,

                conflicts:
                    0,

                transientError:
                    result.error,
            };


        default:

            return {

                pushed:
                    0,

                pulled:
                    0,

                accepted:
                    0,

                rejected:
                    0,

                conflicts:
                    0,

                transientError:
                    "Unknown synchronization result.",
            };
    }
}


/*
 * ============================================================
 * Synchronization message
 * ============================================================
 */

function getSyncingMessage(
    trigger: SyncTrigger
): string {

    switch (trigger) {

        case "NETWORK":

            return (
                "Connection restored — syncing"
            );


        case "MANUAL":

            return (
                "Synchronizing"
            );


        case "STARTUP":

            return (
                "Checking synchronization"
            );


        case "INTERVAL":

            return (
                "Synchronizing"
            );


        default:

            return (
                "Synchronizing"
            );
    }
}


/*
 * ============================================================
 * Successful synchronization description
 * ============================================================
 */

function buildSuccessDescription(
    pushed: number,
    pulled: number
): string {

    const parts:
        string[] = [];


    if (
        pushed > 0
    ) {

        parts.push(
            `${pushed} local event${
                pushed === 1
                    ? ""
                    : "s"
            } uploaded`
        );
    }


    if (
        pulled > 0
    ) {

        parts.push(
            `${pulled} remote event${
                pulled === 1
                    ? ""
                    : "s"
            } received`
        );
    }


    return (
        parts.join(" · ") ||
        "Everything is up to date."
    );
}