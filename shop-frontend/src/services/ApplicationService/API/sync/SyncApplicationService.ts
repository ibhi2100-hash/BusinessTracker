import {
    BusinessManager,
} from "@/src/Composer/BusinessManager";

import {
    SyncResult,
} from "@/src/offline/sqlite/businessDatabase/sync/syncEngine";
import  { SyncConflict } from "@/src/offline/sqlite/businessDatabase/sync/types"
import {
    SyncTrigger,
    SyncCoordinatorEvent,
} from "@/src/offline/sqlite/businessDatabase/sync/SyncCoordinator/SyncCoordinator";

import {
    SyncApplicationState,
} from "./SyncApplicationState";


export interface SyncApplicationEvent {

    type:
        | "STARTED"
        | "COMPLETED"
        | "FAILED";

    trigger:
        SyncTrigger;

    result:
        SyncResult | null;

    error:
        string | null;

    startedAt:
        number;

    completedAt:
        number | null;
}


type StateListener =
    (
        state: SyncApplicationState
    ) => void;


type EventListener =
    (
        event: SyncApplicationEvent
    ) => void;


export class SyncApplicationService {

    private state:
        SyncApplicationState = {

        status:
            "SYNCED",

        pendingEvents:
            0,

        uploadedEvents:
            0,

        acceptedEvents:
            0,

        rejectedEvents:
            0,

        conflictEvents:
            0,
        activities:
            [],
        
        deviceCursor:
            0,

        

        lastPulledGlobalPosition:
            0,

        lastSyncAt:
            null,

        lastSyncDurationMs:
            null,

        lastResult:
            null,

        conflicts:
            [],

        error:
            null,
    };


    private readonly stateListeners =
        new Set<StateListener>();


    private readonly eventListeners =
        new Set<EventListener>();


    private unsubscribeSynchronization:
        (() => void) | null = null;


    private initialized =
        false;


    private disposed =
        false;


    constructor(
        private readonly manager:
            BusinessManager
    ) {}


    /*
     * ========================================================
     * Lifecycle
     * ========================================================
     */

    async initialize(): Promise<void> {

        if (this.disposed) {
            throw new Error(
                "SyncApplicationService has been disposed."
            );
        }


        if (this.initialized) {
            return;
        }


        const app =
            await this.manager.current();


        this.unsubscribeSynchronization =
            app.synchronization.subscribe({

                onSyncStarted:
                    trigger => {

                        this.state = {
                            ...this.state,

                            status:
                                "SYNCING",

                            error:
                                null,
                        };


                        this.emitState();


                        this.emitEvent({

                            type:
                                "STARTED",

                            trigger,

                            result:
                                null,

                            error:
                                null,

                            startedAt:
                                Date.now(),

                            completedAt:
                                null,
                        });
                    },


                onSyncCompleted:
                    event => {

                        this.applyCompletedResult(
                            event
                        );


                        this.emitState();


                        this.emitEvent({

                            type:
                                "COMPLETED",

                            trigger:
                                event.trigger,

                            result:
                                event.result,

                            error:
                                null,

                            startedAt:
                                event.startedAt,

                            completedAt:
                                event.completedAt,
                        });
                    },


                onSyncFailed:
                    error => {

                        const message =
                            normalizeError(
                                error
                            ).message;


                        this.state = {
                            ...this.state,

                            status:
                                "ERROR",

                            error:
                                message,
                        };


                        this.emitState();


                        this.emitEvent({

                            type:
                                "FAILED",

                            trigger:
                                "MANUAL",

                            result:
                                null,

                            error:
                                message,

                            startedAt:
                                Date.now(),

                            completedAt:
                                null,
                        });
                    },
            });


        this.initialized =
            true;
    }


    async dispose(): Promise<void> {

        if (this.disposed) {
            return;
        }


        this.disposed =
            true;


        this.unsubscribeSynchronization?.();

        this.unsubscribeSynchronization =
            null;


        this.stateListeners.clear();

        this.eventListeners.clear();
    }


    /*
     * ========================================================
     * State
     * ========================================================
     */

    getState():
        SyncApplicationState {

        return this.state;
    }


    subscribe(
        listener: StateListener
    ): () => void {

        if (this.disposed) {
            return () => {};
        }


        this.stateListeners.add(
            listener
        );


        listener(
            this.state
        );


        return () => {

            this.stateListeners.delete(
                listener
            );
        };
    }


    subscribeEvents(
        listener: EventListener
    ): () => void {

        if (this.disposed) {
            return () => {};
        }


        this.eventListeners.add(
            listener
        );


        return () => {

            this.eventListeners.delete(
                listener
            );
        };
    }


    /*
     * ========================================================
     * Commands
     * ========================================================
     */

    async syncNow(): Promise<SyncResult> {

        this.assertUsable();


        const app =
            await this.manager.current();


        return app.synchronization.syncNow();
    }


    /*
     * ========================================================
     * Internal state projection
     * ========================================================
     */

    private applyCompletedResult(
        event: SyncCoordinatorEvent
    ): void {

        const result =
            event.result;


        const summary =
            summarizeResult(
                result
            );


        this.state = {

            ...this.state,

            status:
                this.statusFromResult(
                    result
                ),

            uploadedEvents:
                summary.pushed,

            acceptedEvents:
                summary.accepted,

            rejectedEvents:
                summary.rejected,

            conflictEvents:
                summary.conflicts,

            lastResult:
                result,

            lastSyncAt:
                event.completedAt,

            lastSyncDurationMs:
                event.completedAt -
                event.startedAt,

            lastPulledGlobalPosition:
                result.cursor,

            conflicts:
                summary.conflictItems,

            error:
                result.kind === "transient"
                    ? result.error
                    : null,
        };
    }


    private statusFromResult(
        result: SyncResult
    ): SyncApplicationState["status"] {

        switch (result.kind) {

            case "conflict":
                return "CONFLICT";

            case "rejected":
                return "ERROR";

            case "transient":
                return "ERROR";

            case "idle":
            case "synced":
                return "SYNCED";
        }
    }


    private emitState(): void {

        for (
            const listener
            of this.stateListeners
        ) {

            listener(
                this.state
            );
        }
    }


    private emitEvent(
        event: SyncApplicationEvent
    ): void {

        for (
            const listener
            of this.eventListeners
        ) {

            listener(
                event
            );
        }
    }


    private assertUsable(): void {

        if (this.disposed) {

            throw new Error(
                "SyncApplicationService has been disposed."
            );
        }


        if (!this.initialized) {

            throw new Error(
                "SyncApplicationService has not been initialized."
            );
        }
    }

    async start(): Promise<void> {
        const app = await this.manager.current();

        await app.synchronization.start();
    }
}


/*
 * ============================================================
 * Result projection
 * ============================================================
 */

interface SyncSummary {

    pushed:
        number;

    accepted:
        number;

    pulled:
        number;

    rejected:
        number;

    conflicts:
        number;

    conflictItems:
        SyncConflict[];
}


function summarizeResult(
    result: SyncResult
): SyncSummary {

    switch (result.kind) {

        case "idle":

            return {

                pushed:
                    0,

                accepted:
                    0,

                pulled:
                    result.pulled,

                rejected:
                    0,

                conflicts:
                    0,

                conflictItems:
                    [],
            };


        case "synced":

            return {

                pushed:
                    result.pushed,

                accepted:
                    result.pushed,

                pulled:
                    result.pulled,

                rejected:
                    result.rejected,

                conflicts:
                    0,

                conflictItems:
                    [],
            };


        case "conflict":

            return {

                pushed:
                    result.accepted.length,

                accepted:
                    result.accepted.length,

                pulled:
                    result.pulled,

                rejected:
                    result.rejected.length,

                conflicts:
                    result.conflicts.length,

                conflictItems:
                    result.conflicts,
            };


        case "rejected":

            return {

                pushed:
                    result.accepted.length,

                accepted:
                    result.accepted.length,

                pulled:
                    result.pulled,

                rejected:
                    result.rejected.length,

                conflicts:
                    0,

                conflictItems:
                    [],
            };


        case "transient":

            return {

                pushed:
                    0,

                accepted:
                    0,

                pulled:
                    0,

                rejected:
                    0,

                conflicts:
                    0,

                conflictItems:
                    [],
            };
    }
}


function normalizeError(
    error: unknown
): Error {

    if (error instanceof Error) {
        return error;
    }


    if (typeof error === "string") {
        return new Error(error);
    }


    try {

        return new Error(
            JSON.stringify(error)
        );

    } catch {

        return new Error(
            "Unknown synchronization error"
        );
    }
}