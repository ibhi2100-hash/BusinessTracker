import { unknown } from "zod";
import { StorageBusContract } from "../database/StorageBusContract";
import { rejects } from "assert";
import { WorkerRequest } from "../protocol/WorkerRequest";

export class StorageBus implements StorageBusContract {

    constructor(
        private readonly worker: Worker
    ){}

    private readonly pending =
        new Map<
            string,
            {
                resolve(value: unknown): void;

                reject(reason?: unknown): void;
            }
        >();

    send<TResult>(request: WorkerRequest): Promise<TResult> {
        
    }









} 