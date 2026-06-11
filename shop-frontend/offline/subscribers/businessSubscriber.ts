import { liveQuery } from "dexie";
import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";

let subscription: any = null;

export function startBusinessSubscriber() {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;

  const db = getDb(userId);
  if (!db) return;

  // Avoid duplicate subscriptions
  if (subscription) return;

  subscription = liveQuery(async () => {
    const business = await db.businesses.toArray();
    const branches = await db.branches.toArray();

    return {
      business: business[0] ?? null,
      branches,
      activeBranch: branches[0] ?? null
    };
  }).subscribe({
    next: (data) => {
      useBusinessStore.getState().setBusiness(data.business);
      useBranchStore.getState().setBranches(data.branches);

      if (data.activeBranch) {
        useBranchStore
          .getState()
          .setActiveBranch(data.activeBranch.id);
      }
    },
    error: (err) => {
      console.error("[BusinessSubscriber] error:", err);
    },
  });
}

export function stopBusinessSubscriber() {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
}