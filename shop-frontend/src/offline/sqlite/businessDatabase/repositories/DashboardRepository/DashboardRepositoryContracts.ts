import { DashboardSummary } from "@business/shared-types";

export interface DashboardRepository {
  getSummary(
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