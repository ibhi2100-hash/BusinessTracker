import { Alert } from "@/types/branchAlertsTypes";
import { create } from "zustand";

interface AlertState {
  alerts: Record<string, Alert []>; // branchId → alerts
  setAlerts: (branchId: string, alerts: Alert[]) => void;
  clearAlerts: (branchId: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: {},

  setAlerts: (branchId, alerts) =>
    set((state) => ({
      alerts: { ...state.alerts, [branchId]: alerts },
    })),

  clearAlerts: (branchId) =>
    set((state) => {
      const copy = { ...state.alerts };
      delete copy[branchId];
      return { alerts: copy };
    }),
}));