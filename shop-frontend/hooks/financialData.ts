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

// Skeleton/fallback data
const SKELETON_SUMMARY = {
  todaySales: 0,
  cashAtHand: 0,
  inventoryValue: 0,
  outstandingLiabilities: 0,
  netProfit: 0,
};

export function useDashboardFinancialData(startDate: string, endDate: string) {
  const setSummary = useFinancialStore((state) => state.setSummary);
  const setProfitLoss = useFinancialStore((state) => state.setProfitLoss);
  const setCashflow = useFinancialStore((state) => state.setCashflow);
  const setBalanceSheet = useFinancialStore((state) => state.setBalanceSheet);

  // Validate dates
  const isValidDate = (d: string) => !isNaN(Date.parse(d));
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new Error("Invalid startDate or endDate");
  }

  // useQueries: always same number of queries
  const results = useQueries({
    queries: [
      {
        queryKey: ["financialSummary", startDate, endDate],
        queryFn: () => fetchFinancialSummary(startDate, endDate).catch(() => SKELETON_SUMMARY),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["profitLoss", startDate, endDate],
        queryFn: () => fetchProfitLoss(startDate, endDate).catch(() => ({})),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["cashflow", startDate, endDate],
        queryFn: () => fetchCashflow(startDate, endDate).catch(() => ({ inflow: 0, outflow: 0 })),
        staleTime: 1000 * 60 * 5,
      },
      {
        queryKey: ["balanceSheet", startDate, endDate],
        queryFn: () => fetchBalanceSheet().catch(() => ({ assets: 0, liabilities: 0 })),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });

  const [summaryQuery, profitLossQuery, cashflowQuery, balanceSheetQuery] = results;

  // Push data into Zustand store
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