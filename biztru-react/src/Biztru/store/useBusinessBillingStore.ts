
import { create } from "zustand";

import type {
  PublicBillingPlan,
  BusinessSubscription,
} from "../../types/billing/business-billing.types";

interface BusinessBillingStore {
  plans: PublicBillingPlan[];
  subscription: BusinessSubscription | null;

  catalogueRevision: number;
  lastSyncedAt: string | null;
  isOffline: boolean;
  loading: boolean;

  setPlans: (
    plans: PublicBillingPlan[],
    revision: number
  ) => void;

  setSubscription: (
    subscription: BusinessSubscription | null
  ) => void;

  setOffline: (offline: boolean) => void;
  setLoading: (loading: boolean) => void;

  reset: () => void;
}

const initialState = {
  plans: [],
  subscription: null,
  catalogueRevision: 0,
  lastSyncedAt: null,
  isOffline: false,
  loading: false,
};

export const useBusinessBillingStore =
  create<BusinessBillingStore>((set) => ({
    ...initialState,

    setPlans: (plans, revision) =>
      set({
        plans,
        catalogueRevision: revision,
        lastSyncedAt: new Date().toISOString(),
      }),

    setSubscription: (subscription) =>
      set({ subscription }),

    setOffline: (isOffline) =>
      set({ isOffline }),

    setLoading: (loading) =>
      set({ loading }),

    reset: () => set(initialState),
  }));
