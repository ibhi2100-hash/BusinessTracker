import { ProjectionRepository } from "./projectionRepository";
import { projectorRegistry } from "./projectorRegistry";
import { BaseEvent } from "@business/shared-types";
export class ProjectionEngine {

  constructor(
    private repo: ProjectionRepository
  ) {}

  async process(event: BaseEvent) {

    const projectors =
      projectorRegistry[event.type] ?? [];

    for (const projector of projectors) {

      const current =
        await this.repo.load(
          projector.projection,
          event.aggregateId
        );

      const next =
        projector.reducer.reduce(
          current,
          event
        );

      await this.repo.save(
        projector.projection,
        next
      );
    }
  }
}