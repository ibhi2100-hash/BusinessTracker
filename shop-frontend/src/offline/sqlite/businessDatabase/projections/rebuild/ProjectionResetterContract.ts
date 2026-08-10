import { ProjectionName } from "../../repositories/ProjectionResetRepository/ProjectionResetRepositoryContract";

export interface ProjectionResetter {
    resetAll(): Promise<void>;
    reset(name: ProjectionName): Promise<void>;
}