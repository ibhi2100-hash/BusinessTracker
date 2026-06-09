import { ProjectionRepository } from "./projectionRepository";
import { BaseEvent } from "@business/shared-types";
export declare class ProjectionEngine {
    private repo;
    constructor(repo: ProjectionRepository);
    process(event: BaseEvent): Promise<void>;
}
