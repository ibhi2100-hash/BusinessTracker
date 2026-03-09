import { initialize } from "next/dist/server/lib/render-server";

const API_URL = process.env.NEXT_PUBLIC_API_URL


export const subscriptionService  = {

    getSubscription: async ()=> {
        const res = await fetch(`${API_URL}/subscription/plans`, {
            credentials: "include"
    });

        if (!res.ok) throw new Error(`Failed to fetch Subscription : ${res.statusText}`);
        const data = await res.json();
        return data; // backend returns { data: Cashflow }
    },

    initializePayment: async (planId: string )=> {
        const res = await fetch(`${API_URL}/subscription/initialize-payment`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId })
        });

        if (!res.ok) throw new Error(`Failed to initialize payment: ${res.statusText}`);
        const data = await res.json();
        return data;
    },

    verifyPayment: async (reference: string )=> {
        const res = await fetch(`${API_URL}/subscription/verify-payment`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference })
        });
        if (!res.ok) throw new Error(`Failed to verify payment: ${res.statusText}`);
        const data = await res.json();
        return data;
    }
};