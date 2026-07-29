export const WorkerOperation = {

    OPEN_NODE: "OPEN_NODE",

    CLOSE_NODE: "CLOSE_NODE",

    OPEN_CLIENT: "OPEN_CLIENT",

    CLOSE_CLIENT: "CLOSE_CLIENT",
    
    LIST_NODES: "LIST_NODES",

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