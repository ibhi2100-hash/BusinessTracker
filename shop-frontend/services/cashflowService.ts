
const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface Cashflow {
    id: string;
    businessId: string;
    branchId?: string;
    type: "INFLOW" | "OUTFLOW";
    amount: number;
    source: string;
    description?: string;
    isOpening: boolean;
    createdAt: string;
}


export const CashflowService = {

    injectCash: async (amount: number, description?: string): Promise<Cashflow> => {
        const res = await fetch(`${API_URL}/cashflow/inject`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, description })
        });

        if (!res.ok) throw new Error(`Failed to inject cash: ${res.statusText}`);
        const data = await res.json();
        return data.data; // backend returns { data: Cashflow }
    },

    withdrawCash: async (amount: number, description?: string): Promise<Cashflow> => {
        const res = await fetch(`${API_URL}/cashflow/withdraw`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, description })
        });

        if (!res.ok) throw new Error(`Failed to withdraw cash: ${res.statusText}`);
        const data = await res.json();
        return data.data;
    },

    getAllCashflows: async (): Promise<Cashflow[]> => {
        const res = await fetch(`${API_URL}/cashflow`, {
            method: "GET",
            credentials: "include"
        });

        if (!res.ok) throw new Error(`Failed to fetch cashflows: ${res.statusText}`);
        const data = await res.json();
        return data; // backend returns an array of cashflows
    }, 
};