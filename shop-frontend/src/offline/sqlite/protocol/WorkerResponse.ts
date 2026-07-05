export interface WorkerResponse<T = unknown> {

    readonly id: string;

    readonly result?: T;

    readonly error?: string;

}