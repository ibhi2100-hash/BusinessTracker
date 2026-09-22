import {
    SyncEngine,
} from "../syncEngine";

import { SyncResult, SyncCoordinatorListener, SyncTrigger, SyncCoordinatorEvent, SyncCoordinatorResult } from "@business/shared-types";

export class SyncCoordinator {

    isSyncing = false;

    private activeSync: Promise<SyncResult> | null = null;

    private _lastResult:
        SyncResult | null = null;

    private listeners =
        new Set<SyncCoordinatorListener>();


    constructor(
        private readonly engine:
            SyncEngine
    ) {}


    async initialize(): Promise<void> {
        // Reserved for future synchronization
        // initialization.
    }


    async sync(
        trigger: SyncTrigger
    ): Promise<SyncResult> {

       

        if (this.activeSync) {
            return this.activeSync;
        }

        this.activeSync = this.execute(
            trigger
        ).finally(() => {
            this.activeSync = null;
            this.isSyncing = false
        })

        this.isSyncing = true;

          return await this.activeSync;
    }

    private async execute(
        trigger: SyncTrigger
    ): Promise<SyncResult> {

        const startedAt = Date.now();

        this.emitStarted(trigger);

        try {

            const result =
                await this.engine.sync();

            const completedAt =
                Date.now();

            this._lastResult =
                result;

            this.emitCompleted({
                trigger,
                result,
                startedAt,
                completedAt,
            });

            return result;

        } catch (error) {

            const normalized =
                normalizeError(error);

            this.emitFailed(
                normalized
            );

            throw normalized;
        }
    }
    private emitStarted(
        trigger: SyncTrigger
    ): void {

        for (
            const listener
            of this.listeners
        ) {

            listener.onSyncStarted(
                trigger
            );
        }
    }

    private emitCompleted(
        event: SyncCoordinatorEvent
    ): void {

        for (
            const listener
            of this.listeners
        ) {

            listener.onSyncCompleted(
                event
            );
        }
    }

    private emitFailed(
        error: Error
    ): void {

        for (
            const listener
            of this.listeners
        ) {

            listener.onSyncFailed(
                error
            );
        }
    }
    get activeSyncResult(): Promise<SyncResult> | null {

        return this.activeSync;
    }

    get IsSyncing(): boolean {

        return this.isSyncing;
    }


    get lastResult(): SyncResult | null {

        return this._lastResult;
    }


    subscribe(
        listener:
            SyncCoordinatorListener
    ): () => void {

        this.listeners.add(
            listener
        );


        return () => {

            this.listeners.delete(
                listener
            );
        };
    }


    async dispose(): Promise<void> {

        this.listeners.clear();
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