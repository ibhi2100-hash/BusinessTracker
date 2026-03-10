import { create } from "zustand";
type Balances = {
  cash: number
  inventory: number
  revenue: number
  cogs: number
  assets: number
  liabilities: number
  expenses: number
}

type LedgerEntry = {
  account: keyof Balances
  amount: number
}

type DashboardStore = {
  balances: Balances
  applyLedgerEntries: (entries: LedgerEntry[]) => void
}
export const useDashboardStore = create<DashboardStore>((set)=> ({

    balances: {
        cash: 0,
        inventory: 0,
        revenue: 0,
        cogs: 0,
        assets: 0,
        liabilities: 0,
        expenses: 0,
    },

    applyLedgerEntries: (entries)=> {
        set((state)=> {
            const updated = { ...state.balances}

            for (const entry of entries){
                updated[entry.account] = 
                    (updated[entry.account] || 0) + entry.amount
            }

            return { balances: updated}
        })
    }
}))