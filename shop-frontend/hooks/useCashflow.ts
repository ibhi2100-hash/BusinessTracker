"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CashflowService } from "@/services/cashflowService";
import type { Cashflow, CashFlowType } from "@/services/cashflowService";

interface CashflowPayload {
  amount: number;
  type: CashFlowType;
  description?: string;
}

export function useCashflows(autoFetch = true) {
  const queryClient = useQueryClient();

  // Fetch all cashflows
  const query = useQuery<Cashflow[], Error>({
    queryKey: ["cashflows"],
    queryFn: CashflowService.getAllCashflows,
    staleTime: 1000 * 60 * 5,
    enabled: autoFetch,
  });

  // Inject cash mutation
  const injectMutation = useMutation({
    mutationFn: (payload: CashflowPayload) =>
      CashflowService.injectCash(payload.amount, payload.type, payload.description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cashflows"] }),
  });

  // Withdraw cash mutation
  const withdrawMutation = useMutation({
    mutationFn: (payload: CashflowPayload) =>
      CashflowService.withdrawCash(payload.amount, payload.type, payload.description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cashflows"] }),
  });

  return {
    cashflows: Array.isArray(query.data) ? query.data : [], // ✅ always array
    loading: query.isLoading,
    error: query.error,
    injectCash: injectMutation.mutateAsync,
    withdrawCash: withdrawMutation.mutateAsync,
    refetch: query.refetch,
  };
}