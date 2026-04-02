import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Business } from "@/types/types";

interface BusinessState {
  business: Business | null;
  hydrated: boolean;

  setBusiness: (business: Business | null) => void;
  clearBusiness: () => void;
  setHydrated: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      business: null,
      hydrated: false,

      setBusiness: (business) => set({ business }),
      clearBusiness: () => set({ business: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "business-storage",

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(); // ✅ now fully typed
      },
    }
  )
);