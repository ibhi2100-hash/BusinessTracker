"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFinancialStore } from "@/store/financialDataStore";
import { fetchDashboardData } from "../../services/dashboard.service";
import { getDb } from "@/offline/db/indexDB";
import { TABLES } from "@/offline/db/schema";

interface DashboardData {
  dashboardSummary: any;
  profitLoss: any;
  cashflow: any;
  balanceSheet: any;
  todaySales: number;
  cashAtHand: number;
  salesTrend: any[];
  expenseBreakdown: any[];
  topProducts: any[];
}

interface DashboardPeriod {
  startDate: string;
  endDate: string;
}

/**
 * Hook to fetch and maintain dashboard data reactively.
 * - Updates Zustand store.
 * - Saves snapshot in IndexedDB every 50 events.
 */
export function useDashboardFinancialData(startDate: string, endDate: string) {
  const dashboardSummaryInStore = useFinancialStore(
    (state) => state.dashboardSummary
  );
  const store = useFinancialStore();

  // Fetch dashboard data via react-query
  const query = useQuery<DashboardData, Error>({
    queryKey: ["dashboardData", startDate, endDate],
    queryFn: () => fetchDashboardData({ startDate, endDate }),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!query.data) return;

    const {
      dashboardSummary,
      cashAtHand,
      profitLoss,
      cashflow,
      balanceSheet,
      salesTrend,
      expenseBreakdown,
      topProducts,
    } = query.data;

    // ✅ Only update store if data actually changed
    if (
      JSON.stringify(dashboardSummaryInStore) !==
      JSON.stringify(dashboardSummary)
    ) {
      store.setDashboardSummary(dashboardSummary);
      store.setReports({
        cashAtHand,
        profitLoss,
        cashflow,
        balanceSheet,
        salesTrend,
        expenseBreakdown,
        topProducts,
      });
    }

  
  }, [query.data, dashboardSummaryInStore, store]);

  return query;
}