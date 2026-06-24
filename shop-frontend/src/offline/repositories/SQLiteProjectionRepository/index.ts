// SQLiteProjectionRepository.ts

import { projectionRegistry } from "./ProjectionRegistry";

export class SQLiteProjectionRepository {

  async load(
    projection: string,
    aggregateId: string
  ) {
    const repo =
      projectionRegistry[
        projection as keyof typeof projectionRegistry
      ];

    if (!repo) return null;

    return repo.findById(
      aggregateId
    );
  }

  async save(
    projection: string,
    aggregateId: string,
    state: any
  ) {
    const repo =
      projectionRegistry[
        projection as keyof typeof projectionRegistry
      ];

    if (!repo) return;

    await repo.upsert(
      aggregateId,
      state
    );
  }
}