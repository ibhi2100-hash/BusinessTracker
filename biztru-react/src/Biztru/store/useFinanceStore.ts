import { create } from "zustand";

// ---------------------------
// TYPES
// ---------------------------
type FinancialState = {
    revenue: number;
    cogs: number;
    expenses: number;

    cash: number;
    inventoryValue: number;

    grossProfit: number;
    netProfit: number;

    today: {
        revenue: number;
        cogs: number;
        expenses: number;
        grossProfit: number;
        netProfit: number;
    };

    // reducers only
    _applyEntry: (entry: {
        account: string;
        debit: number;
        credit: number;
        timestamp: number;
    }) => void;

    _reset: () => void;
};

// ---------------------------
// STORE
// ---------------------------
export const useFinancialStore = create<FinancialState>((set, get) => ({

    // ---------------------------
    // GLOBAL METRICS
    // ---------------------------
    revenue: 0,
    cogs: 0,
    expenses: 0,

    cash: 0,
    inventoryValue: 0,

    grossProfit: 0,
    netProfit: 0,

    today: {
        revenue: 0,
        cogs: 0,
        expenses: 0,
        grossProfit: 0,
        netProfit: 0
    },

    // ---------------------------
    // APPLY LEDGER ENTRY
    // ---------------------------
    _applyEntry: (entry) =>
        set((state) => {
            const { account, debit = 0, credit = 0, timestamp } = entry;

            const now = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0);

            const isToday = timestamp >= start.getTime();

            let {
                revenue,
                cogs,
                expenses,
                cash,
                inventoryValue,
                today
            } = state;

            // -------------------------
            // ACCOUNT LOGIC
            // -------------------------
            switch (account) {
                case "Revenue":
                    revenue += credit;
                    if (isToday) today.revenue += credit;
                    break;

                case "COGS":
                    cogs += debit;
                    if (isToday) today.cogs += debit;
                    break;

                case "Cash":
                    cash += debit - credit;
                    break;

                case "Inventory":
                    inventoryValue += debit - credit;
                    break;

                default:
                    // treat all others as expense
                    if (account !== "Cash") {
                        expenses += debit;
                        if (isToday) today.expenses += debit;
                    }
            }

            // -------------------------
            // DERIVED
            // -------------------------
            const grossProfit = revenue - cogs;
            const netProfit = grossProfit - expenses;

            const todayGross = today.revenue - today.cogs;
            const todayNet = todayGross - today.expenses;

            return {
                revenue,
                cogs,
                expenses,
                cash,
                inventoryValue,
                grossProfit,
                netProfit,
                today: {
                    ...today,
                    grossProfit: todayGross,
                    netProfit: todayNet
                }
            };
        }),

    // ---------------------------
    // RESET (REBUILD)
    // ---------------------------
    _reset: () =>
        set({
            revenue: 0,
            cogs: 0,
            expenses: 0,
            cash: 0,
            inventoryValue: 0,
            grossProfit: 0,
            netProfit: 0,
            today: {
                revenue: 0,
                cogs: 0,
                expenses: 0,
                grossProfit: 0,
                netProfit: 0
            }
        })
}));