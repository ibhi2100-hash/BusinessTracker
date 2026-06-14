import { AppDB } from "@/src/db";
import { IndexedDbProjectionRepository } from "@/src/repositories/indexedDbProjectRepo";
import { OperationalProjectionEngine } from "@business/projection-families"

export function CreateProjectionEngine(
  db: AppDB
) {
  const repo = new IndexedDbProjectionRepository(db);
  const projectionEngine =
    new OperationalProjectionEngine(repo);
  
  return projectionEngine
}
