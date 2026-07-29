export type storageRequest = {
    id: string;
    type:
        |"OPEN"
        |"PREPARE"
        |"BEGIN"
        |"COMMIT"
        |"ROLLBACK"
        |"CLOSE";

    payload: any;
}

export type StorageResponse = {
    id: string;

    success: boolean;

    result?: unknown;

    error?: string
}
enum WorkerState {
    STOPPED,
    INITIALIZING,
    READY,
    CLOSING
}