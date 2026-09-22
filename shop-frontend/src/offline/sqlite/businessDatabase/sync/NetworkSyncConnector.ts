import {
    SyncCoordinator,
} from "./SyncCoordinator/SyncCoordinator";


export interface NetworkSyncConnectorOptions {

    intervalMs?: number;

    syncOnStart?: boolean;
}


export class NetworkSyncConnector {

    private readonly intervalMs: number;

    private readonly syncOnStart: boolean;

    private intervalId: number | null = null;
    private started = false;


    constructor(
        private readonly coordinator:
            SyncCoordinator,

        options:
            NetworkSyncConnectorOptions = {}
    ) {

        this.intervalMs =
            options.intervalMs ??
            30_000;


        /*
         * Default is false because
         * BusinessSynchronization owns
         * application startup synchronization.
         */

        this.syncOnStart =
            options.syncOnStart ??
            false;
    }


    /*
     * ============================================================
     * START
     * ============================================================
     */

    start(): void {

        if (this.started) {
            return;
        }


        if (
            typeof window === "undefined"
        ) {

            return;
        }

        this.started = true;

        window.addEventListener(
            "online",
            this.handleOnline
        );

        window.addEventListener(
            "offline",
            this.handleOffline
        );
        /*
         * Periodic synchronization.
         */

        this.intervalId =
            window.setInterval(
                () => {

                    if (
                        !navigator.onLine
                    ) {
                        return;
                    }
                    void this.runSync(
                        "INTERVAL"
                    );

                },
                this.intervalMs
            );


        /*
         * Optional connector-owned startup sync.
         *
         * Normally disabled because
         * BusinessSynchronization owns startup.
         */

        if (
            this.syncOnStart &&
            navigator.onLine
        ) {

            void this.runSync(
                "STARTUP"
            );
        }
    }
    /*
     * ============================================================
     * STOP
     * ============================================================
     */

    stop(): void {

        if (!this.started) {
            return;
        }
        this.started = false;

        if (
            typeof window !== "undefined"
        ) {
            window.removeEventListener(
                "online",
                this.handleOnline
            );
            window.removeEventListener(
                "offline",
                this.handleOffline
            );
        }

        if (
            this.intervalId !== null
        ) {

            window.clearInterval(
                this.intervalId
            );

            this.intervalId = null;
        }
    }
    /*
     * ============================================================
     * SYNC TRIGGER
     * ============================================================
     */

    private async runSync(
        trigger:
            "STARTUP" |
            "NETWORK" |
            "INTERVAL"
    ): Promise<void> {

        try {

            await this.coordinator.sync(
                trigger
            );

        } catch (error) {

            /*
             * Synchronization failure must not
             * create an unhandled Promise rejection.
             *
             * The coordinator is responsible for
             * notifying synchronization listeners.
             */

            console.error(
                `[NetworkSyncConnector] ${trigger} sync failed:`,
                error
            );
        }
    }


    /*
     * ============================================================
     * NETWORK ONLINE
     * ============================================================
     */

    private readonly handleOnline =
        (): void => {

            void this.runSync(
                "NETWORK"
            );
        };


    /*
     * ============================================================
     * NETWORK OFFLINE
     * ============================================================
     */

    private readonly handleOffline =
        (): void => {

            /*
             * Do not attempt synchronization.
             *
             * Existing local events remain safely
             * in the outbox as PENDING.
             */
        };
}