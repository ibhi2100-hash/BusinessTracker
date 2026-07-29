// operational/engine/OperationalProjectionEngine.ts


import { ProjectionRepository } from "../../contracts/ProjectionRepository";
import { operationalRegistry } from "../registry/index";

export class OperationalProjectionEngine<TEvent> {

  constructor(private repo: ProjectionRepository) {}

  async process(event: TEvent): Promise<void> {

    const handlers =
      operationalRegistry[event.type ] ?? [];
      
    for (const handler of handlers) {
      const projectionId =
        handler.aggregateResolver?.(event)
        ?? event.aggregateId

      const current =
        await this.repo.load(
          handler.projection,
          projectionId
        );
      const next =
        handler.reducer.reduce(current, event);

      await this.repo.save(
        handler.projection,
        projectionId,
        next
      );
    }
  }
}