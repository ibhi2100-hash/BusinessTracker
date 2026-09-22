import type { SQLiteStatementOperation } from "@/src/storage/statement/worker/WorkerProtocol";
import { ProjectionName } from "../../repositories/ProjectionResetRepository/ProjectionResetRepositoryContract";

export interface ProjectionResetter {

    resetOperations():
        readonly SQLiteStatementOperation[];

    resetOperation(
        name: ProjectionName
    ): SQLiteStatementOperation;

}