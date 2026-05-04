import { create } from "zustand";
interface Summary {
    todaySales: number;
    cashAtHand: number;
    inventoryValue: number;
    outstandingLiabilities: number;
    netProfit: number;
}
interface summaryState {
    summary: Summary;
    setSummary: (summary: Summary) => void
}

export const useDashboardStore = create<summaryState>((set) => ({
  summary: {
    todaySales: 0,
    cashAtHand: 0,
    inventoryValue: 0,
    outstandingLiabilities: 0,
    netProfit: 0,
  },
  setSummary: (summary) => set({ summary }),
}));