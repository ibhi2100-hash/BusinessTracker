import { Lifecycle } from "../../lifecycle/LifeCycle";

import {
    SyncEngine,
    SyncResult,
} from "../sync/syncEngine";

import {
    SyncCoordinator,
} from "../sync/SyncCoordinator/SyncCoordinator";

import {
    NetworkSyncConnector,
} from "../sync/NetworkSyncConnector";

export class BusinessSynchronization
implements Lifecycle {

    constructor(
        readonly engine: SyncEngine,
        readonly coordinator: SyncCoordinator,
        readonly network: NetworkSyncConnector,
    ) {}


    async initialize(): Promise<void> {

        await this.coordinator.initialize();
    }


    async start(): Promise<void> {

        this.network.start();
    }


    async stop(): Promise<void> {

        this.network.stop();
    }


    async dispose(): Promise<void> {

        this.network.stop();

        await this.coordinator.dispose();
    }


    async syncNow(): Promise<SyncResult> {

        return this.coordinator.sync(
            "MANUAL"
        );
    }


    get isSyncing(): boolean {

        return this.coordinator.isSyncing;
    }


    subscribe(
        listener: Parameters<
            SyncCoordinator["subscribe"]
        >[0]
    ) {

        return this.coordinator.subscribe(
            listener
        );
    }
}