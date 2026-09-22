import {
    ProjectionName,
    ProjectionResetRepository,
} from "../../repositories/ProjectionResetRepository/ProjectionResetRepositoryContract";

import { ProjectionResetter } from "./ProjectionResetterContract";

import type {
    SQLiteStatementOperation,
} from "@/src/storage/statement/worker/WorkerProtocol";


export class ProjectionReset
    implements ProjectionResetter {

    constructor(
        private readonly repository: ProjectionResetRepository
    ) {}

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