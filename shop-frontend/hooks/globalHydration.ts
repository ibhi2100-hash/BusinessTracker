import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
 

export function useGlobalHydration() {
  const businessHydrated = useBusinessStore((s) => s.hydrated);
  const branchHydrated = useBranchStore((s) => s.hydrated);
  const authHydrated = useAuthStore((s) => s.hydrated);

  return businessHydrated && branchHydrated && authHydrated;
}