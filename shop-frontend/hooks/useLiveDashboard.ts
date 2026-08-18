// hooks/useLiveDashboard.ts (example)
import { useCallback } from "react";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";
import { DashboardSummary } from "@business/shared-types";

export function useLiveDashboard(branchId: string | null) {
  const app = useApplication();

  const query = useCallback(async (): Promise<DashboardSummary> => {
    if (!branchId) return null;
    return await app.dashboard.getSummary(branchId);
  }, [app, branchId]);

  return useLiveQuery<DashboardSummary>(
    ["ledger", "inventories", "sales"],
    query,
    null
  );
}