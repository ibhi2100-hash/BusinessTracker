import { Lifecycle } from "../../lifecycle/LifeCycle";

import { SyncResult, SyncCoordinatorListener } from "@business/shared-types";
import { SyncCoordinator } from "../sync/SyncCoordinator/SyncCoordinator";

import {
    NetworkSyncConnector,
} from "../sync/NetworkSyncConnector";


export class BusinessSynchronization
    implements Lifecycle {

    private started = false;

    private initialized = false;


    constructor(
        private readonly coordinator:
            SyncCoordinator,

        private readonly triggerSource:
            NetworkSyncConnector,
    ) {}


    /*
     * ============================================================
     * INITIALIZE
     * ============================================================
     */

    async initialize(): Promise<void> {

        if (this.initialized) {
            return;
        }


        await this.coordinator.initialize();


        this.initialized = true;
    }


    /*
     * ============================================================
     * START
     * ============================================================
     */

    async start(): Promise<void> {

        if (!this.initialized) {

            throw new Error(
                "BusinessSynchronization must be initialized before start."
            );
        }


        if (this.started) {
            return;
        }


        this.started = true;


        /*
         * Start network and interval triggers.
         */

        this.triggerSource.start();


        /*
         * Startup synchronization is deliberately
         * non-blocking.
         *
         * The application must not wait for the
         * network before becoming usable.
         */

        if (
            typeof navigator !== "undefined" &&
            navigator.onLine
        ) {

            void this.coordinator
                .sync("STARTUP")
                .catch(error => {

                    console.error(
                        "[BusinessSynchronization] Startup sync failed:",
                        error
                    );

                });
        }
    }


    /*
     * ============================================================
     * STOP
     * ============================================================
     */

    async stop(): Promise<void> {

        if (!this.started) {
            return;
        }


        this.started = false;


        this.triggerSource.stop();
    }


    /*
     * ============================================================
     * DISPOSE
     * ============================================================
     */

    async dispose(): Promise<void> {

        await this.stop();


        await this.coordinator.dispose();


        this.initialized = false;
    }


    /*
     * ============================================================
     * MANUAL SYNC
     * ============================================================
     */

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


    /*
     * ============================================================
     * STATE
     * ============================================================
     */

    get isSyncing(): boolean {

        return this.coordinator.isSyncing;
    }


    /*
     * ============================================================
     * SUBSCRIBE
     * ============================================================
     */

    subscribe(
        listener: SyncCoordinatorListener
    ): () => void {

        return this.coordinator.subscribe(
            listener
        );
    }
}