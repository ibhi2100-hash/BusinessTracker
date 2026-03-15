// /offline/hydration/hydrateStores.ts
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { User, Business } from "@/types/types";

interface HydrationPayload {
  user: User;
  accessToken: string;
  expiresIn?: number;
  business?: Business;
}

export function hydrateStores({
  user,
  accessToken,
  expiresIn,
  business,
}: HydrationPayload) {
  // Auth store
  useAuthStore.getState().setLogin(user, accessToken, expiresIn);
  
  useBusinessStore.getState().setBusiness(business)

  // Mark hydrated
  useAuthStore.getState().setHydrated(true);
}