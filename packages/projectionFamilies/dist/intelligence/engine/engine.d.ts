import { ProjectionRepository } from "../../contracts/projectionRepository";
export declare class IntelligenceProjectionEngine {
    private repo;
    constructor(repo: ProjectionRepository);
    process(metric: any): Promise<void>;
}
