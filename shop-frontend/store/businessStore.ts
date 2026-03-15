// store/useBusinessStore.ts
import { create } from "zustand";
import { Business } from "@/types/types";
interface BusinessState {
  business: Business | null;
  setBusiness: (business: Business | null) => void;
  clearBusiness: () => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  business: null,
  setBusiness: (business) => set({ business }),
  clearBusiness: () => set({ business: null }),
}));