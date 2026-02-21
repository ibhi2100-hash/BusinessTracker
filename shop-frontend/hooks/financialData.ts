"use client";

import { useQueries } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFinancialStore } from "@/store/financialDataStore";
import {
  fetchFinancialSummary,
  fetchProfitLoss,
  fetchCashflow,
  fetchBalanceSheet,
} from "../services/dashboard.service";

const SKELETON_SUMMARY = {
  todaySales: 0,
  cashAtHand: 0,
  inventoryValue: 0,
  outstandingLiabilities: 0,
  netProfit: 0,
};

export function useDashboardFinancialData(
  branchId: string | null,
  startDate: string,
  endDate: string
) {
  const setSummary = useFinancialStore((state) => state.setSummary);
  const setProfitLoss = useFinancialStore((state) => state.setProfitLoss);
  const setCashflow = useFinancialStore((state) => state.setCashflow);
  const setBalanceSheet = useFinancialStore((state) => state.setBalanceSheet);

  // ALWAYS call useQueries with the same number of queries
  const results = useQueries({
    queries: [
      {
        queryKey: ["financialSummary", branchId],
        queryFn: () =>
          branchId
            ? fetchFinancialSummary(branchId, startDate, endDate)
            : Promise.resolve(SKELETON_SUMMARY),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["profitLoss", branchId, startDate, endDate],
        queryFn: () =>
          branchId
            ? fetchProfitLoss(branchId, startDate, endDate)
            : Promise.resolve({}),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["cashflow", branchId, startDate, endDate],
        queryFn: () =>
          branchId
            ? fetchCashflow(branchId, startDate, endDate)
            : Promise.resolve({ inflow: 0, outflow: 0 }),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["balanceSheet", branchId],
        queryFn: () =>
          branchId ? fetchBalanceSheet(branchId) : Promise.resolve({ assets: 0, liabilities: 0 }),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const [summaryQuery, profitLossQuery, cashflowQuery, balanceSheetQuery] = results;

  useEffect(() => {
    if (summaryQuery.data) setSummary(summaryQuery.data);
    if (profitLossQuery.data) setProfitLoss(profitLossQuery.data);
    if (cashflowQuery.data) setCashflow(cashflowQuery.data);
    if (balanceSheetQuery.data) setBalanceSheet(balanceSheetQuery.data);
  }, [
    summaryQuery.data,
    profitLossQuery.data,
    cashflowQuery.data,
    balanceSheetQuery.data,
    setSummary,
    setProfitLoss,
    setCashflow,
    setBalanceSheet,
  ]);

  return { summaryQuery, profitLossQuery, cashflowQuery, balanceSheetQuery };
}