import { SQLiteProjectionRepository } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProjectionRepository";
import { OperationalProjectionEngine } from "@business/projection-families"

export function CreateProjectionEngine() {
  const repo = new SQLiteProjectionRepository()
    const projectionEngine =
    new OperationalProjectionEngine(repo);
  
  return projectionEngine
}
