import { BaseEvent } from "@business/shared-types";
import { ProjectionRepository } from "../../contracts/projectionRepository";
export declare class OperationalProjectionEngine {
    private repo;
    constructor(repo: ProjectionRepository);
    process(event: BaseEvent): Promise<void>;
}
