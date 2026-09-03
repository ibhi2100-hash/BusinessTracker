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

    private intervalId:
        ReturnType<typeof setInterval>
        | null = null;

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

        this.syncOnStart =
            options.syncOnStart ??
            true;
    }


    start(): void {

        if (this.started) {
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


        this.intervalId =
            setInterval(
                () => {

                    if (
                        !navigator.onLine
                    ) {
                        return;
                    }

                    void this.coordinator.sync(
                        "INTERVAL"
                    );

                },
                this.intervalMs
            );


        if (
            this.syncOnStart &&
            navigator.onLine
        ) {

            void this.coordinator.sync(
                "STARTUP"
            );
        }
    }


    stop(): void {

        if (!this.started) {
            return;
        }

        this.started = false;


        window.removeEventListener(
            "online",
            this.handleOnline
        );

        window.removeEventListener(
            "offline",
            this.handleOffline
        );


        if (
            this.intervalId !== null
        ) {

            clearInterval(
                this.intervalId
            );

            this.intervalId = null;
        }
    }


    private readonly handleOnline =
        (): void => {

            void this.coordinator.sync(
                "NETWORK"
            );
        };


    private readonly handleOffline =
        (): void => {

            // No sync operation is started.
            //
            // The UI can observe navigator.onLine
            // or receive a separate offline event.
        };
}