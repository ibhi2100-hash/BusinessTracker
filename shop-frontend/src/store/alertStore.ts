import { Alert } from "@/types/branchAlertsTypes";
import { create } from "zustand";

interface AlertState {
  alerts: Record<string, Alert []>; // branchId → alerts
  hydrated: boolean;
  setAlerts: (branchId: string, alerts: Alert[]) => void;
  setHydrated: () => void
  clearAlerts: (branchId: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: {},
  hydrated: false,

  setAlerts: (branchId, alerts) =>
    set((state) => ({
      alerts: { ...state.alerts, [branchId]: alerts },
    })),
  
  setHydrated: () => set({ hydrated: true }),

  clearAlerts: (branchId) =>
    set((state) => {
      const copy = { ...state.alerts };
      delete copy[branchId];
      return { alerts: copy };
    }),
}));