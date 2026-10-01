import type { SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";  
import type { ProjectionName } from "../../repositories/ProjectionResetRepository/ProjectionResetRepositoryContract";

export interface ProjectionResetter {

    resetOperations():
        readonly SQLiteStatementOperation[];

    resetOperation(
        name: ProjectionName
    ): SQLiteStatementOperation;

}