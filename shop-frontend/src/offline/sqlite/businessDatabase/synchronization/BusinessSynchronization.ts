import { Lifecycle } from "../../lifecycle/LifeCycle";

import {
    SyncEngine,
    SyncResult,
} from "../sync/syncEngine";

import {
    SyncCoordinator,
    SyncCoordinatorListener,
} from "../sync/SyncCoordinator/SyncCoordinator";

import {
    NetworkSyncConnector,
} from "../sync/NetworkSyncConnector";

export class BusinessSynchronization
implements Lifecycle {

    private started =
        false;

    private initialized =
        false;


    constructor(
        private readonly engine: SyncEngine,
        private readonly coordinator: SyncCoordinator,
        private readonly triggerSource: NetworkSyncConnector,
    ) {}


    async initialize(): Promise<void> {

        if (this.initialized) {
            return;
        }


        await this.coordinator.initialize();


        this.initialized =
            true;
    }


    async start(): Promise<void> {

        if (!this.initialized) {

            throw new Error(
                "BusinessSynchronization must be initialized before start."
            );
        }


        if (this.started) {
            return;
        }


        this.started =
            true;


        /*
         * Start network / interval triggers.
         */

        this.triggerSource.start();


        /*
         * Startup synchronization is intentionally
         * non-blocking.
         */

        if (
            typeof navigator !== "undefined" &&
            navigator.onLine
        ) {

            void this.coordinator
                .sync("STARTUP")
                .catch(error => {

                    console.error(
                        "Startup synchronization failed:",
                        error
                    );
                });
        }
    }


    async stop(): Promise<void> {

        if (!this.started) {
            return;
        }


        this.started =
            false;


        this.triggerSource.stop();
    }


    async dispose(): Promise<void> {

        await this.stop();

        await this.coordinator.dispose();

        this.initialized =
            false;
    }


    async syncNow(): Promise<SyncResult> {

        if (!this.initialized) {

            throw new Error(
                "BusinessSynchronization has not been initialized."
            );
        }


        return this.coordinator.sync(
            "MANUAL"
        );
    }


    get isSyncing(): boolean {

        return this.coordinator.IsSyncing;
    }


    subscribe(
        listener:
            SyncCoordinatorListener
    ) {

        return this.coordinator.subscribe(
            listener
        );
    }
}