import type {
    ProjectionName,
    ProjectionResetRepository,
} from "../../repositories/ProjectionResetRepository/ProjectionResetRepositoryContract";

import type { ProjectionResetter } from "./ProjectionResetterContract";

import type{ SQLiteStatementOperation } from "../../../../../storage/statement/worker/WorkerProtocol";
export class ProjectionReset
    implements ProjectionResetter {
    private readonly repository: ProjectionResetRepository
    constructor(
        repository: ProjectionResetRepository
    ) {
        this.repository = repository
    }

    resetOperation(
        name: ProjectionName
    ): SQLiteStatementOperation {

        return this.repository.resetOperation(
            name
        );
    }

    resetOperations():
        readonly SQLiteStatementOperation[] {

        return this.repository.resetOperations();
    }
}