// operational/engine/OperationalProjectionEngine.ts

import { IntegrationEvent } from "@business/shared-types";
import { ProjectionRepository } from "../../contracts/projectionRepository";
import { operationalRegistry } from "../registry/index";

export class OperationalProjectionEngine {

  constructor(private repo: ProjectionRepository) {}

  async process(event: IntegrationEvent): Promise<void> {

    const handlers =
      operationalRegistry[event.type] ?? [];
      
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