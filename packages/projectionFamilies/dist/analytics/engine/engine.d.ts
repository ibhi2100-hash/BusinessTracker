import { ProjectionRepository } from "../../contracts/projectionRepository";
import { analyticsRegistry } from "../registry";
export declare class AnalyticsProjectionEngine {
    private repo;
    constructor(repo: ProjectionRepository);
    process(input: {
        type: keyof typeof analyticsRegistry;
        key: string;
    } & Record<string, unknown>): Promise<void>;
}
