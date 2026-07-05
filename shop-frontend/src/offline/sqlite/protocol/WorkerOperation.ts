export const WorkerOperation = {

    OPEN_NODE: "OPEN_NODE",

    CLOSE_NODE: "CLOSE_NODE",

    QUERY: "QUERY",

    EXECUTE: "EXECUTE",

    SCALAR: "SCALAR",

    EXISTS: "EXISTS",

    BEGIN_TRANSACTION: "BEGIN_TRANSACTION",

    COMMIT_TRANSACTION: "COMMIT_TRANSACTION",

    ROLLBACK_TRANSACTION: "ROLLBACK_TRANSACTION",

} as const;

export type WorkerOperation =
    typeof WorkerOperation[keyof typeof WorkerOperation];