import { ProjectionRegistry } from "../contracts/ProjectionRegistry";
import { ProjectionRepository } from "../contracts/ProjectionRepository";
import { ProjectionEngine } from "../contracts/projectionEngine";
export declare class DefaultProjectionEngine<TEvent> implements ProjectionEngine<TEvent> {
    private readonly registry;
    private readonly repository;
    constructor(registry: ProjectionRegistry<TEvent>, repository: ProjectionRepository);
    process(event: any): Promise<void>;
}
