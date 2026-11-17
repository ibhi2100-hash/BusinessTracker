import type{ DashboardSummary } from "@business/shared-types";

export interface DashboardRepository {
  getSummary(
    businessId: string,
    branchId: string
  ): Promise<DashboardSummary>;

  getTodaySales(
    branchId: string
  ): Promise<number>;

  getRevenue(
    branchId: string
  ): Promise<number>;

  getExpenses(
    branchId: string
  ): Promise<number>;
}