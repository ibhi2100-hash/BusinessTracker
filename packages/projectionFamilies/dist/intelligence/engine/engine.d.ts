import { ProjectionRepository } from "../../contracts/ProjectionRepository";
export declare class IntelligenceProjectionEngine {
    private repo;
    constructor(repo: ProjectionRepository);
    process(metric: any): Promise<void>;
}
