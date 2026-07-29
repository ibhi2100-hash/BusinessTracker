import { ProjectionRepository } from "../../contracts/ProjectionRepository";
export declare class OperationalProjectionEngine<TEvent> {
    private repo;
    constructor(repo: ProjectionRepository);
    process(event: TEvent): Promise<void>;
}
