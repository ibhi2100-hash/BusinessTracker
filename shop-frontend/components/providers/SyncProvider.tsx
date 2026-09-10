"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import {
    SyncResult,
} from "@/src/offline/sqlite/businessDatabase/sync/syncEngine";

import {
    SyncTrigger,
} from "@/src/offline/sqlite/businessDatabase/sync/SyncCoordinator/SyncCoordinator";

import {
    SyncApplicationService,
    SyncApplicationEvent,
} from "@/src/services/ApplicationService/API/sync/SyncApplicationService";

import {
    SyncApplicationState,
} from "@/src/services/ApplicationService/API/sync/SyncApplicationState";


/*
 * ============================================================
 * Context
 * ============================================================
 */

export interface SyncContextValue {

    status:
        SyncApplicationState["status"];

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
        SyncApplicationState["conflicts"];

    error:
        string | null;

    syncNow():
        Promise<SyncResult>;
}


const SyncContext =
    createContext<
        SyncContextValue | null
    >(null);


interface SyncProviderProps {

    children:
        ReactNode;

    syncService:
        SyncApplicationService;
}


const SYNC_TOAST_ID =
    "business-sync";


export function SyncProvider({
    children,
    syncService,
}: SyncProviderProps) {

    const router =
        useRouter();


    /*
     * ========================================================
     * Application synchronization state
     * ========================================================
     *
     * SyncApplicationService is the single source of truth.
     */

    const [
        syncState,
        setSyncState,
    ] = useState<SyncApplicationState>(
        () =>
            syncService.getState()
    );


    /*
     * ========================================================
     * Synchronization state subscription
     * ========================================================
     */

    useEffect(() => {

        return syncService.subscribe(
            setSyncState
        );

    }, [
        syncService,
    ]);


    /*
     * ========================================================
     * Synchronization event subscription
     *
     * Used only for presentation concerns such as toast
     * notifications.
     * ========================================================
     */

    useEffect(() => {

        return syncService.subscribeEvents(
            handleSynchronizationEvent
        );

    }, [
        syncService,
        router,
    ]);


    /*
     * ========================================================
     * Browser connectivity
     *
     * This does NOT initiate synchronization.
     * ========================================================
     */

    const [
        isOnline,
        setIsOnline,
    ] = useState(
        () =>
            typeof navigator === "undefined"
                ? true
                : navigator.onLine
    );


    useEffect(() => {

        const handleOnline =
            (): void => {

                setIsOnline(true);
            };


        const handleOffline =
            (): void => {

                setIsOnline(false);


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
                                    router.push(
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
        router,
    ]);


    /*
     * ========================================================
     * Manual synchronization command
     * ========================================================
     */

    const syncNow =
        useCallback(
            () =>
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
                    syncState.status,

                isSyncing:
                    syncState.status ===
                    "SYNCING",

                isOnline,

                pendingEvents:
                    syncState.pendingEvents,

                uploadedEvents:
                    syncState.uploadedEvents,

                acceptedEvents:
                    syncState.acceptedEvents,

                rejectedEvents:
                    syncState.rejectedEvents,

                conflictEvents:
                    syncState.conflictEvents,

                lastPulledGlobalPosition:
                    syncState.lastPulledGlobalPosition,

                lastSyncAt:
                    syncState.lastSyncAt,

                lastSyncDurationMs:
                    syncState.lastSyncDurationMs,

                lastResult:
                    syncState.lastResult,

                conflicts:
                    syncState.conflicts,

                error:
                    syncState.error,

                syncNow,
            }),
            [
                syncState,
                isOnline,
                syncNow,
            ]
        );


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
 * Hook
 * ============================================================
 */

export function useSync():
    SyncContextValue {

    const context =
        useContext(
            SyncContext
        );


    if (context === null) {

        throw new Error(
            "useSync must be used inside SyncProvider"
        );
    }


    return context;
}


/*
 * ============================================================
 * Synchronization event presentation
 * ============================================================
 */

function handleSynchronizationEvent(
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
 * Started
 * ============================================================
 */

function handleSyncStarted(
    trigger: SyncTrigger
): void {

    /*
     * Interval synchronization should remain silent.
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
 * Completed
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
     * Interval synchronization remains silent.
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
 * Failed
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
 * Helpers
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
                    result.rejected,

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
    }
}


function getSyncingMessage(
    trigger: SyncTrigger
): string {

    switch (trigger) {

        case "NETWORK":
            return "Connection restored — syncing";

        case "MANUAL":
            return "Synchronizing";

        case "STARTUP":
            return "Checking synchronization";

        case "INTERVAL":
            return "Synchronizing";
    }
}


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