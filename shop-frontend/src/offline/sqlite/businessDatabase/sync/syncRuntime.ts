import {
    BusinessRepositoryRegistry,
} from "../repositories/RepositoryRegistry";

import {
    SyncEngine,
} from "./syncEngine";

import {
    SyncCoordinator,
} from "./SyncCoordinator/SyncCoordinator";

import {
    HttpSyncTransport,
} from "./SyncTransport";


export interface SyncRuntimeOptions {

    apiBaseUrl: string;

    pushBatchSize?: number;

    pullBatchSize?: number;

    lockDurationMs?: number;

    baseBackoffMs?: number;
}


export class SyncRuntime {

    readonly transport:
        HttpSyncTransport;

    readonly engine:
        SyncEngine;

    readonly coordinator:
        SyncCoordinator;


    constructor(
        repositories:
            BusinessRepositoryRegistry,

        options:
            SyncRuntimeOptions
    ) {

        this.transport =
            new HttpSyncTransport(
                options.apiBaseUrl
            );


        this.engine =
            new SyncEngine(

                repositories.outbox,

                this.transport,

                repositories.syncState,

                repositories.events,

                {
                    pushBatchSize:
                        options.pushBatchSize ??
                        50,

                    pullBatchSize:
                        options.pullBatchSize ??
                        100,

                    lockDurationMs:
                        options.lockDurationMs ??
                        30_000,

                    baseBackoffMs:
                        options.baseBackoffMs ??
                        1_000,
                }
            );


        this.coordinator =
            new SyncCoordinator(
                this.engine
            );
    }
}