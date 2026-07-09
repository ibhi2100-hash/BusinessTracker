import { WorkerRequest } from "../protocol/WorkerRequest";  

export interface StorageBusContract {

    send<TResult>(

        request: WorkerRequest

    ): Promise<TResult>;

}