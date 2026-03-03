import { create } from 'zustand';
import { Cashflow } from '@/services/cashflowService';

interface CashflowStore {
    cashflows: Cashflow[];
    loading: boolean;

    setCashflows: (cashflows: Cashflow[]) => void;
    addCashflow: (cashflow: Cashflow) => void;
    resetCashflows: () => void;
}

export const useCashflowStore = create<CashflowStore>((set) => ({
    cashflows: [],
    loading: false,

    setCashflows: (cashflows) => set({ cashflows }),
    addCashflow: (cashflow) =>
        set((state) => ({ cashflows: [...state.cashflows, cashflow] })),
    resetCashflows: () =>
        set({ cashflows: [], loading: false }),
}));