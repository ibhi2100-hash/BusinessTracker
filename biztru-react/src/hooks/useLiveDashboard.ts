// hooks/useLiveDashboard.ts (example)
import { useCallback } from "react";
import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext"; 
import { useLiveQuery } from "./useLiveQuery";
import type{ DashboardSummary } from "@business/shared-types";

export function useLiveDashboard(branchId: string | null) {
  const app = useApplication();

  const query = useCallback(async (): Promise<DashboardSummary | null> => {
    if (!branchId) return null;
    return await app.dashboard.getSummary(branchId);
  }, [app, branchId]);

  return useLiveQuery<DashboardSummary>(
    ["ledger", "inventories", "sales"],
    query,
    null
  );
}