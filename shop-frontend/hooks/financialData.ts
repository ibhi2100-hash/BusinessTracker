"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFinancialStore } from "@/store/financialDataStore";
import { fetchDashboardData } from "../services/dashboard.service";

// Define the type for your dashboard data (adjust fields as needed)
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

export function useDashboardFinancialData(startDate: string, endDate: string) {
  const store = useFinancialStore();

  const query = useQuery<DashboardData, Error>({
    queryKey: ["dashboardData", startDate, endDate],
    queryFn: async () => {
      return fetchDashboardData({ startDate, endDate });
    },
    staleTime: 1000 * 60 * 5, // cache 5 minutes
  });

  // Push data into Zustand store
useEffect(() => {
  if (!query.data) return;

  const {
    cashAtHand,
    dashboardSummary,
    profitLoss,
    cashflow,
    balanceSheet,
    salesTrend,
    expenseBreakdown,
    topProducts,
  } = query.data;

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

}, [query.data]);

  return query;
}