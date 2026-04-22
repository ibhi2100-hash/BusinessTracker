// /offline/hydration/hydrateStores.ts

import { useAuthStore } from "@/src/store/useAuthStore";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";
import { User, Business, Branch } from "@/types/types";

interface HydrationPayload {
  user?: User;
  accessToken?: string;
  expiresAt?: number;
  business?: Business;
  branches?: Branch[];
  activeBranchId?: string;
}

export function hydrateStores(payload: HydrationPayload) {
  const {
    user,
    accessToken,
    expiresAt,
    business,
    branches,
    activeBranchId,
  } = payload;

  const authStore = useAuthStore.getState();
  const businessStore = useBusinessStore.getState();
  const branchStore = useBranchStore.getState();

  // 🔐 AUTH (only hydrate if valid data exists)
  if (user && accessToken) {
    authStore.setLogin(user, accessToken, expiresAt);
  }

  // 🏢 BUSINESS
  if (business) {
    businessStore.setBusiness(business);
  }

  // 🌿 BRANCHES
  if (branches && branches.length > 0) {
    branchStore.setBranches(branches);

    const resolvedBranchId =
      activeBranchId ?? branches[0]?.id;

    if (resolvedBranchId) {
      branchStore.setActiveBranch(resolvedBranchId);
    }
  }
return  
  // ❌ DO NOT SET hydrated here
}