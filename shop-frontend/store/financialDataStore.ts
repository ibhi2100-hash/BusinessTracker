import { create } from "zustand";

interface DashboardSummary {
  todaySales: number;
  netProfit: number;
  inventoryValue: number;
  outstandingLiabilities: number;
  
}

interface FinancialReports {
  profitLoss: any;
  cashflow: any;
  balanceSheet: any;
  cashAtHand: number;
  salesTrend: any[];
  expenseBreakdown: any[];
  topProducts: any[];
}

interface FinancialState {
  dashboardSummary: DashboardSummary;
  reports: FinancialReports;

  setDashboardSummary: (data: DashboardSummary) => void;
  setReports: (data: Partial<FinancialReports>) => void;
}

export const useFinancialStore = create<FinancialState>((set) => ({
  dashboardSummary: {
    todaySales: 0,
    netProfit: 0,
    inventoryValue: 0,
    outstandingLiabilities: 0,
  },

  reports: {
    cashAtHand: 0,
    profitLoss: null,
    cashflow: 0,
    balanceSheet: null,
    salesTrend: [],
    expenseBreakdown: [],
    topProducts: [],
  },

  setDashboardSummary: (data) =>
    set({ dashboardSummary: data }),

  setReports: (data) =>
    set((state) => ({
      reports: { ...state.reports, ...data },
    })),
}));