import { getDb } from "@/src/db";
import { IndexedDbProjectionRepository } from "@/src/repositories/indexedDbProjectRepo";
import { useAuthStore } from "@/src/store/useAuthStore";
import { OperationalProjectionEngine } from "@business/projection-families"

const user = useAuthStore.getState().user;
const userId = user.id;

const db = getDb(userId)

const repo = new IndexedDbProjectionRepository(db);

export const projectionEngine =
  new OperationalProjectionEngine(repo);