// /offline/hydration/hydrateStores.ts
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { User, Business, Branch } from "@/types/types";

interface HydrationPayload {
  user: User;
  accessToken: string;
  expiresIn?: number;
  business?: Business;
  branches?: Branch[];
  activeBranchId?: string;
}

export function hydrateStores({
  user,
  accessToken,
  expiresIn,
  business,
  branches,
  activeBranchId
}: HydrationPayload) {
  // Auth store
  useAuthStore.getState().setLogin(user, accessToken, expiresIn);
  // BusinessStore
  useBusinessStore.getState().setBusiness(business);
  useBranchStore.getState().setBranches(branches || [])

  //If ActiveBranchId is provided, use it. otherwise, default to first branch main branch;
  const defaultBranchId = activeBranchId  || (branches && branches[0]?.id);
  if(defaultBranchId) {
    useBranchStore.getState().setActiveBranch(defaultBranchId);
  }

  // Mark hydrated
  useAuthStore.getState().setHydrated(true);
}