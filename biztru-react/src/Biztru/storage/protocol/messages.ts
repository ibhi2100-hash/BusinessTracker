export interface StorageRequest<T = unknown> {
    id: string;
    type: string;
    payload?: T;
}

export interface StorageResponse<T = unknown> {
    id: string;
    success: boolean;
    result?: T;
    error?: string;
}

export enum StorageMessageType {
    INITIALIZE = "INITIALIZE",

    OPEN_DATABASE = "OPEN_DATABASE",

    CLOSE_DATABASE = "CLOSE_DATABASE",

    EXECUTE = "EXECUTE",

    BEGIN_TRANSACTION = "BEGIN_TRANSACTION",

    COMMIT_TRANSACTION = "COMMIT_TRANSACTION",

    ROLLBACK_TRANSACTION = "ROLLBACK_TRANSACTION",

    PREPARE = "PREPARE"
}