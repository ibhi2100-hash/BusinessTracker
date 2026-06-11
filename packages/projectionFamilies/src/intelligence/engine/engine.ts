import { ProjectionRepository } from "../../contracts/projectionRepository";
import { intelligenceRegistry } from "../registry";

export class IntelligenceProjectionEngine {

  constructor(
    private repo: ProjectionRepository
  ) {}

  async process(metric: any) {

    // ensure we can index the registry even if metric.type is typed as any
    const reducers =
      (intelligenceRegistry as any)[
        metric.type
      ] ?? [];

    for(const reducer of reducers){

      const current =
        await this.repo.load(
          reducer.name,
          metric.key
        );

      const next =
        reducer.reduce(
          current,
          metric
        );

      await this.repo.save(
        reducer.name,
        metric.key,
        next
      );
    }
  }
}