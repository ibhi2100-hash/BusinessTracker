// snapshot/bootstrap.ts
import { SnapshotEngine } from "@business/snapshot-engine";
import { DexieSnapshotRepo } from "@/src/repositories/adapters/RepositoryAdapter";
import { useAuthStore } from "@/src/store/useAuthStore";
import { getDb } from "@/src/db";
import { createSnapshotRegistry } from "./createSnapshotRegistry";
const userId = useAuthStore.getState().user.id;
const db = getDb(userId)
const repo  = new DexieSnapshotRepo(db)
const registry = createSnapshotRegistry()


export const snapshotEngine =
    new SnapshotEngine(
        repo,
        registry
    )