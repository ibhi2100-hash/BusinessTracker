"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCashflowStore } from "@/store/cashflowStore";
import { CashflowService } from "@/services/cashflowService";
import type { Cashflow } from "@/services/cashflowService";

export function useCashflows(autoFetch = true) {
    const store = useCashflowStore();

    // Fetch all cashflows from the backend
    const query = useQuery<Cashflow[], Error>({
        queryKey: ["cashflows"],
        queryFn: () => CashflowService.getAllCashflows(),
        staleTime: 1000 * 60 * 5, // cache for 5 minutes
        enabled: autoFetch, // only fetch automatically if autoFetch is true
    });

    // Push data into Zustand store
    useEffect(() => {
        if (!query.data) return;
        store.setCashflows(query.data);
    }, [query.data]);

    // Inject cash action
    const injectCash = async (amount: number, description?: string) => {
        const newCash = await CashflowService.injectCash(amount, description);
        store.addCashflow(newCash);
        return newCash;
    };

    // Withdraw cash action
    const withdrawCash = async (amount: number, description?: string) => {
        const newCash = await CashflowService.withdrawCash(amount, description);
        store.addCashflow(newCash);
        return newCash;
    };

    return {
        cashflows: store.cashflows,
        loading: query.isLoading,
        error: query.error,
        injectCash,
        withdrawCash,
        refetch: query.refetch,
    };
}