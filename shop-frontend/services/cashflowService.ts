
const API_URL = process.env.NEXT_PUBLIC_API_URL
export type CashFlowType =
  | "OPENING"
  | "OWNER_CAPITAL"
  | "OWNER_WITHDRAWAL"
  | "SALE_INCOME"
  | "PURCHASE_EXPENSE"
  | "ASSET_PURCHASE"
  | "ASSET_DISPOSAL"
  | "LIABILITY_PAYMENT"
  | "EXPENSE";

export interface Cashflow {
  id: string;
  businessId: string;
  branchId: string;
  type: CashFlowType;
  direction: "IN" | "OUT";
  amount: number;
  balanceAfter: number;
  source?: string | null;
  description: string | null;
  isOpening: boolean;
  createdAt: string;
}


export const CashflowService = {

    injectCash: async (amount: number, type: CashFlowType, description?: string ): Promise<Cashflow> => {
        const res = await fetch(`${API_URL}/cashflow/inject`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, type,  description })
        });

        if (!res.ok) throw new Error(`Failed to inject cash: ${res.statusText}`);
        const data = await res.json();
        return data.data; // backend returns { data: Cashflow }
    },

    withdrawCash: async (amount: number, type: CashFlowType,  description?: string): Promise<Cashflow> => {
        const res = await fetch(`${API_URL}/cashflow/withdraw`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, type, description })
        });

        if (!res.ok) throw new Error(`Failed to withdraw cash: ${res.statusText}`);
        const data = await res.json();
        return data.data;
    },

    getAllCashflows: async (): Promise<Cashflow[]> => {
        const res = await fetch(`${API_URL}/cashflow`, {
            credentials: "include"
        });

        if (!res.ok) throw new Error(`Failed to fetch cashflows: ${res.statusText}`);
        const data = await res.json();
        return data ?? []; // backend returns an array of cashflows
    }, 
};