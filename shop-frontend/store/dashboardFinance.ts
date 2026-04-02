import { create } from "zustand";

interface BranchDashboardSummary {
  cash: any;
  inventoryValue: any;
  profit: any;
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
    branchDashboardSummary: BranchDashboardSummary; 
    financialReport: FinancialReports;

  setBranchDashboardSummary: (data: BranchDashboardSummary) => void;
  setReports: (data: Partial<FinancialReports>) => void;
}

export const useFinancialStore = create<FinancialState>((set) => ({
  branchDashboardSummary: {
      cash: 0,
  inventoryValue: 0,
  profit: 0,
  },

  financialReport: {
    cashAtHand: 0,
    profitLoss: null,
    cashflow: 0,
    balanceSheet: null,
    salesTrend: [],
    expenseBreakdown: [],
    topProducts: [],
  },

  setBranchDashboardSummary: (data) =>
    set({ branchDashboardSummary: data }),

  setReports: (data) =>
    set((state) => ({
      financialReport: { ...state.financialReport, ...data },
    })),
}));