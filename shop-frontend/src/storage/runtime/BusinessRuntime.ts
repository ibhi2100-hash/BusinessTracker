import { QueryRunner } from "../queryRunner/QueryRunner";
import { TransactionManager } from "../transaction/TransactionManager";
import { SQLiteRuntime } from "./SQLiteRuntime";
import { Lifecycle } from "@/src/offline/sqlite/lifecycle/LifeCycle";
import type { DatabaseId } from "../statement/worker/DatabaseId";


export class BusinessRuntime
    implements Lifecycle {

    readonly queryRunner: QueryRunner;
    readonly transactionManager: TransactionManager;

    constructor(
        readonly businessId: string,
        readonly database: DatabaseId,
        readonly sqlite: SQLiteRuntime,
        queryRunner: QueryRunner,
        transactionManager: TransactionManager,
    ) {
        this.queryRunner = queryRunner;
        this.transactionManager = transactionManager;
    }


    /**
     * The shared SQLiteRuntime is already owned by the
     * application/client layer.
     *
     * BusinessRuntime does not initialize the worker.
     */
    async initialize(): Promise<void> {
        // No-op.
        //
        // The shared SQLiteRuntime is initialized by
        // ClientBootstrapper.
    }


    /**
     * BusinessRuntime does not start the shared worker.
     */
    async start(): Promise<void> {
        // No-op.
    }


    /**
     * BusinessRuntime must NEVER stop the shared SQLiteRuntime.
     *
     * The application-level owner is responsible for stopping it.
     */
    async stop(): Promise<void> {
        // No-op.
    }


    /**
     * BusinessRuntime must NEVER dispose the shared SQLiteRuntime.
     */
    async dispose(): Promise<void> {
        // No-op.
    }
}