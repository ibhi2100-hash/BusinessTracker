// operational/engine/OperationalProjectionEngine.ts

import { BaseEvent } from "@business/shared-types";
import { ProjectionRepository } from "../../contracts/projectionRepository";
import { operationalRegistry } from "../registry/index";

export class OperationalProjectionEngine {

  constructor(private repo: ProjectionRepository) {}

  async process(event: BaseEvent) {

    const handlers =
      operationalRegistry[event.type] ?? [];

    for (const handler of handlers) {

      const current =
        await this.repo.load(
          handler.projection,
          event.aggregateId
        );

      const next =
        handler.reducer.reduce(current, event);

      await this.repo.save(
        handler.projection,
        event.aggregateId,
        next
      );
    }
  }
}