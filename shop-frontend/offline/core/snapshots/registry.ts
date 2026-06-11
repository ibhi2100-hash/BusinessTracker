// snapshot/bootstrap.ts
import { SnapshotEngine } from "@business/snapshot-engine";
import { DexieSnapshotRepo } from "@/src/repositories/adapters/RepositoryAdapter";
import { useAuthStore } from "@/src/store/useAuthStore";
import { getDb } from "@/src/db";
import { createSnapshotRegistry } from "./createSnapshotRegistry";
const user =
  useAuthStore.getState().user;

if (!user?.id) {
  throw new Error("User not available");
}
const userId = user.id;
const db = getDb(userId)
const repo  = new DexieSnapshotRepo(db)
const registry = createSnapshotRegistry()


export const snapshotEngine =
    new SnapshotEngine(
        repo,
        registry
    )