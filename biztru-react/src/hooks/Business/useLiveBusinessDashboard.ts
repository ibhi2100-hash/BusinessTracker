
// hooks/useLiveBusinessDashboard.ts

import { useCallback } from "react";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "../useLiveQuery";
import type { BusinessBranchPerformance } from "../../Biztru/offline/sqlite/businessDatabase/repositories/DashboardRepository/BusinessDashbaordRepositories";

interface BusinessDashboardSummary {
  cash: number;
  bank: number;
  inventoryValue: number;
  liabilities: number;
  branchCount: number;
  activeBranches: number;
  productCount: number;
  employeeCount: number;
  totalInventoryUnits: number;
  stockedProducts: number;
  outOfStockRows: number;
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  todaySales: number;
  salesCount: number;
}

interface BusinessPerformance {
  revenue: number;
  cogs: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}


export interface BusinessDashboardLiveData {
  summary: BusinessDashboardSummary | null;
  monthlyPerformance: BusinessPerformance | null;
  branches: BusinessBranchPerformance[];
}

export function useLiveBusinessDashboard(
  businessId: string | null | undefined
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BusinessDashboardLiveData | null> => {
      if (!businessId) return null;

      const now = new Date();

      // Local calendar month boundaries.
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).getTime();

      const monthEnd = now.getTime();

      const period = {
        from: monthStart,
        to: monthEnd,
      };

      const [
        summary,
        monthlyPerformance,
        branches,
      ] = await Promise.all([
        app.businessDashboard.getSummary(businessId),
        app.businessDashboard.getPerformance(businessId, period),
        app.businessDashboard.getBranchPerformance(
          businessId,
          period
        ),
      ]);

      return {
        summary,
        monthlyPerformance,
        branches: branches ?? [],
      };
    },
    [app, businessId]
  );

  return useLiveQuery<BusinessDashboardLiveData>(
    [
      "ledger",
      "inventories",
      "sales",
      "branches",
      "employees",
      "expenses",
    ],
    query,
    null
  );
}