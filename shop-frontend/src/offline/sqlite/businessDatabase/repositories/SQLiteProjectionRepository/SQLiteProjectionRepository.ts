// SQLiteProjectionRepository.ts

import { ProjectionRepository } from "@business/projection-families";
import { projectionRegistry } from "./projectionRegistry";

export class SQLiteProjectionRepository
  implements ProjectionRepository {
  async load(
    projection: string,
    aggregateId: string
  ): Promise<any> {
    const repo = projectionRegistry[projection as keyof typeof projectionRegistry];

    if(!repo) return null;

    return repo.findById(
        aggregateId,
    )
  }

  async save(
    projection: string,
    aggregateId: string,
    state: any
  ): Promise<void> {

    const repo = projectionRegistry[projection as keyof typeof projectionRegistry];

    if(!repo) return;

    await repo.upsert(
        aggregateId,
        state
    )
  }
}