import { create } from "zustand";

interface FinancialState {
  summary: any;
  profitLoss: any;
  cashflow: any;
  balanceSheet: any;
  setSummary: (data: any) => void;
  setProfitLoss: (data: any) => void;
  setCashflow: (data: any) => void;
  setBalanceSheet: (data: any) => void;
}

export const useFinancialStore = create<FinancialState>((set) => ({
  summary: null,
  profitLoss: null,
  cashflow: null,
  balanceSheet: null,
  setSummary: (data) => set({ summary: data }),
  setProfitLoss: (data) => set({ profitLoss: data }),
  setCashflow: (data) => set({ cashflow: data }),
  setBalanceSheet: (data) => set({ balanceSheet: data }),
}));