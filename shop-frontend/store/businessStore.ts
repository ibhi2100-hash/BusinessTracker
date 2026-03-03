// store/useBusinessStore.ts
import { create } from "zustand";

export interface Business {
  id: string;
  name: string;
  isOnboarding: boolean;
  createdAt: string;
  updatedAt: string;
}

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