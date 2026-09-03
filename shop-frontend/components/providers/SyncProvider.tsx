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

import {
    useRouter,
} from "next/navigation";

import {
    toast,
} from "sonner";

import {
    SyncCoordinatorEvent,
    SyncTrigger,
} from "@/src/offline/sqlite/businessDatabase/sync/SyncCoordinator/SyncCoordinator";

import { BusinessSynchronization } from "@/src/offline/sqlite/businessDatabase/synchronization/BusinessSynchronization";
import { SyncResult } from "@/src/offline/sqlite/businessDatabase/sync/syncEngine";

interface SyncContextValue {

    isSyncing: boolean;

    isOnline: boolean;

    lastSyncAt:
        number | null;

    lastResult:
        SyncResult | null;

    syncNow():
        Promise<SyncResult>;
}


const SyncContext =
    createContext<
        SyncContextValue | null
    >(null);


interface SyncProviderProps {

    children: ReactNode;

    synchronization: BusinessSynchronization;
}


const SYNC_TOAST_ID =
    "business-sync";


export function SyncProvider({
    children,
    synchronization,
}: SyncProviderProps) {

    const router =
        useRouter();


    /*
     * ---------------------------------------------------------
     * Synchronization state
     * ---------------------------------------------------------
     */

    const [
        isSyncing,
        setIsSyncing
    ] = useState(false);


    const [
        isOnline,
        setIsOnline
    ] = useState(
        typeof navigator === "undefined"
            ? true
            : navigator.onLine
    );


    const [
        lastSyncAt,
        setLastSyncAt
    ] =
        useState<number | null>(
            null
        );


    const [
        lastResult,
        setLastResult
    ] =
        useState<
            SyncResult | null
        >(null);


    /*
     * ---------------------------------------------------------
     * Coordinator notifications
     *
     * The provider does NOT start synchronization.
     *
     * It only observes the coordinator.
     * ---------------------------------------------------------
     */

    useEffect(() => {

        const unsubscribe =
            synchronization.subscribe({

                /*
                 * -------------------------------------------------
                 * Synchronization started
                 * -------------------------------------------------
                 */

                onSyncStarted(
                    trigger
                ) {

                    setIsSyncing(true);


                    /*
                     * Interval synchronization is intentionally
                     * quiet. We only notify the user if something
                     * important happens.
                     */
                    if (
                        trigger ===
                        "INTERVAL"
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
                },


                /*
                 * -------------------------------------------------
                 * Synchronization completed
                 * -------------------------------------------------
                 */

                onSyncCompleted(event: SyncCoordinatorEvent) {

                    setIsSyncing(false);

                    setLastSyncAt(
                        event.completedAt
                    );

                    setLastResult(
                        event.result
                    );

                    handleSyncResult(
                        event.trigger,
                        event.result
                    );
                },



                /*
                 * -------------------------------------------------
                 * Synchronization failed outside the normal
                 * SyncEngine result flow.
                 * -------------------------------------------------
                 */

                onSyncFailed(
                    error
                ) {

                    setIsSyncing(false);


                    toast.error(
                        "Synchronization failed",
                        {
                            id:
                                SYNC_TOAST_ID,

                            description:
                                error.message,

                            duration:
                                10_000,

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
                },
            });


        return unsubscribe;

    }, [
        synchronization,
        router,
    ]);


    /*
     * ---------------------------------------------------------
     * Browser connectivity state
     *
     * IMPORTANT:
     *
     * This listener does NOT trigger synchronization.
     *
     * NetworkSyncConnector owns that responsibility.
     *
     * This listener only updates React UI state and informs
     * the user when the browser goes offline.
     * ---------------------------------------------------------
     */

    useEffect(() => {

        const handleOnline =
            () => {

                setIsOnline(
                    true
                );
            };


        const handleOffline =
            () => {

                setIsOnline(
                    false
                );


                toast.warning(
                    "You're offline",
                    {
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
     * ---------------------------------------------------------
     * Manual synchronization
     *
     * This is the UI's explicit synchronization command.
     *
     * The coordinator remains responsible for single-flight
     * protection, cycles, and engine execution.
     * ---------------------------------------------------------
     */

    const syncNow =
        useCallback(
            async () => {

                return synchronization.syncNow();

            },
            [
                synchronization,
            ]
        );


    /*
     * ---------------------------------------------------------
     * Interpret synchronization results
     * ---------------------------------------------------------
     */

    const handleSyncResult =
        useCallback(
            (   trigger: SyncTrigger,
                result: SyncResult
            ): void => {

                const summary =
                    summarizeResult(
                        result
                    );


                /*
                 * -----------------------------------------------
                 * Conflict has highest priority.
                 * -----------------------------------------------
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
                                        router.push(
                                            "/sync-management"
                                        ),
                            },
                        }
                    );

                    return;
                }


                /*
                 * -----------------------------------------------
                 * Permanent rejections.
                 * -----------------------------------------------
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
                                        router.push(
                                            "/sync-management"
                                        ),
                            },
                        }
                    );

                    return;
                }


                /*
                 * -----------------------------------------------
                 * Transient/network/backend error.
                 * -----------------------------------------------
                 */

                if (
                    summary.transientError
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
                                        router.push(
                                            "/sync-management"
                                        ),
                            },
                        }
                    );

                    return;
                }


                /*
                 * -----------------------------------------------
                 * Nothing changed.
                 *
                 * Interval synchronization stays silent.
                 *
                 * Manual synchronization explicitly tells the
                 * user that everything is current.
                 * -----------------------------------------------
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
                 * -----------------------------------------------
                 * Successful useful synchronization.
                 * -----------------------------------------------
                 */

                /*
                 * Interval synchronization should remain quiet
                 * even when it successfully synchronized data.
                 */
                if (
                    trigger === "INTERVAL"
                ) {

                    toast.dismiss(
                        SYNC_TOAST_ID
                    );

                    return;
                }


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
            },
            [
                router,
            ]
        );


    /*
     * ---------------------------------------------------------
     * Context value
     * ---------------------------------------------------------
     */

    const value =
        useMemo<
            SyncContextValue
        >(
            () => ({

                isSyncing,

                isOnline,

                lastSyncAt,

                lastResult,

                syncNow,

            }),
            [
                isSyncing,
                isOnline,
                lastSyncAt,
                lastResult,
                syncNow,
            ]
        );


    return (
        <SyncContext.Provider
            value={
                value
            }
        >
            {
                children
            }
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


    if (!context) {

        throw new Error(
            "useSync must be used inside SyncProvider"
        );
    }


    return context;
}


/*
 * ============================================================
 * Helpers
 * ============================================================
 */

function getSyncingMessage(
    trigger: SyncTrigger
): string {

    switch (
        trigger
    ) {

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
 * Sync Summary
 * ============================================================
 */

interface SyncSummary {

    pushed: number;

    pulled: number;

    rejected: number;

    conflicts: number;

    transientError:
        string | null;
}


function summarizeResult( result: SyncResult ): SyncSummary { 
    let pushed = 0; 
    
    let pulled = 0; 
    
    let rejected = 0; 
    
    let conflicts = 0; 
    
    let transientError: string | null = null; 
    
    switch ( 
        result.kind 
    ) { 
        case "idle": 
        
            pulled = result.pulled; 
            break;

        case "synced":

            pushed = result.pushed; 
            
            pulled = result.pulled; 
            
            rejected = result.rejected; 
            
            break; 
            
        case "conflict": 
            
            pushed = result.accepted.length; 
                
            pulled = result.pulled; 
            
            rejected = result.rejected.length; 
            
            conflicts = result.conflicts.length; 
            
            break; 
            
        case "rejected":
            
            pushed = result.accepted.length; 
            
            pulled = result.pulled; 
            
            rejected = result.rejected.length; 
            
            break; 
            
        case "transient":
            
            transientError = result.error;
            
            break; 
    } 
    
    
    return { 
        pushed, 
        pulled, 
        rejected, 
        conflicts, 
        transientError,
     };
}

/*
 * ============================================================
 * Success Description
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

