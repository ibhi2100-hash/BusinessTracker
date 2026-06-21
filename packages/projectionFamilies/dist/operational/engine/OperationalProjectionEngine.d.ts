import { IntegrationEvent } from "@business/shared-types";
import { ProjectionRepository } from "../../contracts/projectionRepository";
export declare class OperationalProjectionEngine {
    private repo;
    constructor(repo: ProjectionRepository);
    process(event: IntegrationEvent): Promise<void>;
}
