import { nanoid } from "nanoid";
import { StorageRequest, StorageResponse } from "../protocol/messages";
import { resolve } from "path";
import { unknown } from "zod";

export class StorageWorkerClient {
    private worker: Worker;

    private pending = new Map<
    string,
    {
        resolve(value: unknown): void;
        reject(reason?: unknown): void;
    }
    >();

    constructor(){
        this.worker = new Worker(
            new URL(
                "../storage.worker.ts",
                import.meta.url
            ),
            {
                type: "module"
            }
        );

        this.worker.onmessage = this.handleMessage;
    }

    private handleMessage = (
        event: MessageEvent<StorageResponse>
    ) => {
        const response = event.data;

        const promise =
            this.pending.get(response.id);
        if(!promise)
            return;

        this.pending.delete(response.id);

        if(response.success)
            promise.resolve(response.result);
        else
            promise.reject(response.error);
    }

    send<T = unknown>(
        type: string,
        payload?: unknown
    ): Promise<T>{
        const id = nanoid();

        return new Promise((resolve, reject) => {
            this.pending.set(id, {
                resolve,
                reject
            });

            const request: StorageRequest = {
                id,
                type,
                payload
            };
            console.log("The sender send Request: ", request)
            console.log("This is the types that sends: ", request.type)
            this.worker.postMessage(request)
        })
    }
}