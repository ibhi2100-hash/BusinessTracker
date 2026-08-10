import { ProjectionName, ProjectionResetRepository } from "../../repositories/ProjectionResetRepository/ProjectionResetRepositoryContract";
import { ProjectionResetter } from "./ProjectionResetterContract";
export class ProjectionReset
implements ProjectionResetter {
    constructor(
        private readonly repository: ProjectionResetRepository
    ){}

    async resetAll(): Promise<void> {
        await this.repository.resetAll()
    }

    async reset(name: ProjectionName): Promise<void> {
        await this.repository.reset(name)
    }
}