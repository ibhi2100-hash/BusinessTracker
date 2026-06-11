// analytics/engine/AnalyticsProjectionEngine.ts

import { ProjectionRepository } from "../../contracts/projectionRepository";
import { analyticsRegistry } from "../registry";

export class AnalyticsProjectionEngine {

  constructor(private repo: ProjectionRepository) {}

  async process(input: { type: keyof typeof analyticsRegistry; key: string } & Record<string, unknown>) {

    const handlers =
      analyticsRegistry[input.type] ?? [];

    for (const handler of handlers) {

      const current =
        await this.repo.load(
          handler.projection,
          input.key
        );

      const next =
        handler.reducer.reduce(current, input);

      await this.repo.save(
        handler.projection,
        input.key,
        next
      );
    }
  }
}