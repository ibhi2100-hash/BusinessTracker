import {
  projectorRegistry
} from "@business/domain-models";
import { ProjectionRepository } from "@business/domain-models";
import { BaseEvent } from "@business/shared-types";

export class PrismaProjectionEngine {

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