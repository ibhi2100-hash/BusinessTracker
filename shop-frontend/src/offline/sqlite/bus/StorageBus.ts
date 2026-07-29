import { DatabaseTarget } from "../protocol/DatabaseTarget";
import { WorkerOperation } from "../protocol/WorkerOperation";
import { WorkerRequest } from "../protocol/WorkerRequest";
import { WorkerResponse } from "../protocol/WorkerResponse";

export class StorageBus {

    private readonly pending = new Map<
        string,
        {
            resolve(value: unknown): void;
            reject(reason?: unknown): void;
        }
    >();

    constructor(
        private readonly worker: Worker
    ) {

        this.worker.onmessage =
            this.onMessage.bind(this);

        this.worker.onerror =
            this.onError.bind(this);

    }

    private onMessage(
        event: MessageEvent<WorkerResponse>
    ) {

        const response = event.data;

        const pending =
            this.pending.get(response.id);

        if (!pending) {
            return;
        }

        this.pending.delete(response.id);

        if (response.error) {

            pending.reject(
                new Error(response.error)
            );

            return;
        }

        pending.resolve(response.result);

    }

    private onError(
        event: ErrorEvent
    ) {

        for (const pending of this.pending.values()) {

            pending.reject(event.error);

        }

        this.pending.clear();

    }

    send<TResult>(
        request: Omit<WorkerRequest, "id">
    ): Promise<TResult> {

        const id = crypto.randomUUID();

        return new Promise<TResult>(
            (resolve, reject) => {

                this.pending.set(id, {
                    resolve,
                    reject
                });

                this.worker.postMessage({

                    ...request,

                    id

                });

            });

    }

    query<T>(
        database: DatabaseTarget,
        sql: string,
        params: unknown[] = []
    ) {

        return this.send<T[]>({

            database,

            operation: WorkerOperation.QUERY,

            payload: {
                sql,
                params
            }

        });

    }

    execute(
        database: DatabaseTarget,
        sql: string,
        params: unknown[] = []
    ) {

        return this.send<void>({

            database,

            operation: WorkerOperation.EXECUTE,

            payload: {
                sql,
                params
            }

        });

    }

    scalar<T>(
        database: DatabaseTarget,
        sql: string,
        params: unknown[] = []
    ) {

        return this.send<T | null>({

            database,

            operation: WorkerOperation.SCALAR,

            payload: {
                sql,
                params
            }

        });

    }

    exists(
        database: DatabaseTarget,
        sql: string,
        params: unknown[] = []
    ) {

        return this.send<boolean>({

            database,

            operation: WorkerOperation.EXISTS,

            payload: {
                sql,
                params
            }

        });

    }

    beginTransaction(
        database: DatabaseTarget
    ) {

        return this.send<void>({

            database,

            operation: WorkerOperation.BEGIN_TRANSACTION,

            payload: {}

        });

    }

    commitTransaction(
        database: DatabaseTarget
    ) {

        return this.send<void>({

            database,

            operation: WorkerOperation.COMMIT_TRANSACTION,

            payload: {}

        });

    }

    rollbackTransaction(
        database: DatabaseTarget
    ) {

        return this.send<void>({

            database,

            operation: WorkerOperation.ROLLBACK_TRANSACTION,

            payload: {}

        });

    }

    async openBusiness(
        nodeId: string
    ) {

        return this.send<void>({

            database: DatabaseTarget.BUSINESS,

            operation: WorkerOperation.OPEN_NODE,

            payload: {
                nodeId
            }

        });

    }
    async switchBusinessNode(nodeId: string){
        return this.openBusiness(nodeId)
       }

    async closeBusiness() {

        return this.send<void>({

            database: DatabaseTarget.BUSINESS,

            operation: WorkerOperation.CLOSE_NODE,

            payload: {}

        });

    }

    async listBusinessNodes(){
        return this.send<{
            activeNode: string[],
            current: string | null,
            stats: any
        }>({
            database: DatabaseTarget.BUSINESS,
            operation: WorkerOperation.LIST_NODES,
            payload: {}
        })
    }

    async openClient(): Promise<void> {

        await this.send<void>({
            database: DatabaseTarget.CLIENT,
            operation: WorkerOperation.OPEN_CLIENT,
            payload: {}
        });

    }

    async closeClient(): Promise<void> {

        await this.send<void>({
            database: DatabaseTarget.CLIENT,
            operation: WorkerOperation.CLOSE_CLIENT,
            payload: {}
        });

    }

}