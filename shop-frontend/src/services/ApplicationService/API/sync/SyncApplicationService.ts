import { SyncManagementState } from "@/app/(app)/(sync-mgt)/sync-management/components/syncMgtPage";
import { BusinessManager } from "@/src/Composer/BusinessManager";
import { SyncEngine, SyncResult } from "@/src/offline/sqlite/businessDatabase/sync/syncEngine";

export class SyncApplicationService {

    private state: SyncManagementState = {
        status: "SYNCED",

        pendingEvents: 0,

        uploadedEvents: 0,

        acceptedEvents: 0,

        rejectedEvents: 0,

        conflictEvents: 0,

        deviceCursor: 0,

        serverCursor: 0,

        lastSyncAt: null,

        lastSyncDurationMs: null,

        lastResult: null,

        activities: [],

        conflicts: [],

        error: null,
    };


    private listeners =
        new Set<
            (
                state: SyncManagementState
            ) => void
        >();


    constructor(
        private readonly manager: BusinessManager
    ) {}


    getState(): SyncManagementState {
        return this.state;
    }


    subscribe(
        listener: (
            state: SyncManagementState
        ) => void
    ): () => void {

        this.listeners.add(listener);

        listener(this.state);

        return () => {
            this.listeners.delete(listener);
        };
    }


    private emit(): void {

        for (
            const listener
            of this.listeners
        ) {
            listener(this.state);
        }
    }


    async Sync(): Promise<SyncResult> {

        const startedAt =
            Date.now();

        this.state = {
            ...this.state,
            status: "SYNCING",
            error: null,
        };

        this.emit();


        try {

            const app = await this.manager.current();

            const result = await app.synchronization.syncNow();


            const completedAt =
                Date.now();


            this.state = {
                ...this.state,

                status:
                    this.statusFromResult(result),

                lastResult:
                    result,

                lastSyncAt:
                    completedAt,

                lastSyncDurationMs:
                    completedAt - startedAt,

                deviceCursor:
                    result.cursor,

                serverCursor:
                    result.cursor,

                error:
                    result.kind === "transient"
                        ? result.error
                        : null,
            };


            this.emit();

            return result;

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);


            this.state = {
                ...this.state,

                status: "ERROR",

                error: message,

                lastSyncDurationMs:
                    Date.now() - startedAt,
            };


            this.emit();

            throw error;
        }
    }


    private statusFromResult(
        result: SyncResult
    ): SyncManagementState["status"] {

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
}