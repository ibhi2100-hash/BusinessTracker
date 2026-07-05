import { WorkerOperation } from "../../protocol/WorkerOperation";
import { QueryHandler } from "../handlers/QueryHandler";
import { ExecuteHandler } from "../handlers/ExecuteHandler";
import { ScalarHandler } from "../handlers/ScalarHandler";
import { ExistHandler } from "../handlers/ExistsHandler";
import { OpenNodeHandler } from "../handlers/OpenNodeHandler";
import { CloseNodeHandler } from "../handlers/CloseNodeHandler";


import { BeginTransactionHandler } from "../handlers/BeginTransactionHandler";
import { CommitTransactionHandler } from "../handlers/CommitTransactionHandler";
import { RollbackTransactionHandler } from "../handlers/RollbackTransactionHandler";

const handlers = {

    [WorkerOperation.QUERY]: QueryHandler,

    [WorkerOperation.EXECUTE]: ExecuteHandler,

    [WorkerOperation.SCALAR]: ScalarHandler,

    [WorkerOperation.EXISTS]: ExistHandler,

    [WorkerOperation.OPEN_NODE]: OpenNodeHandler,

    [WorkerOperation.CLOSE_NODE]: CloseNodeHandler,

    [WorkerOperation.BEGIN_TRANSACTION]: BeginTransactionHandler,

    [WorkerOperation.COMMIT_TRANSACTION]: CommitTransactionHandler,

    [WorkerOperation.ROLLBACK_TRANSACTION]: RollbackTransactionHandler,

} as const;

export function resolveHandler(
    operation: WorkerOperation
) {

    const handler =
        handlers[operation];

    if (!handler) {

        throw new Error(
            `Unsupported operation '${operation}'.`
        );

    }

    return handler;

}