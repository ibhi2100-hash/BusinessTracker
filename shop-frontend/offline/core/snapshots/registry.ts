// snapshot/bootstrap.ts
import { SnapshotEngine } from "@business/snapshot-engine";
import { DexieSnapshotRepo } from "@/src/repositories/adapters/RepositoryAdapter";
import { useAuthStore } from "@/src/store/useAuthStore";
import { AppDB, getDb } from "@/src/db";
import { createSnapshotRegistry } from "./createSnapshotRegistry";


export function CreateSnapshotEngine(
  db: AppDB
) {
  const repo = new DexieSnapshotRepo(db)
  const registry = createSnapshotRegistry()
  
  return new SnapshotEngine(
        repo,
        registry
    )   
}
  