// hooks/useLiveDashboard.ts (example)
import { useCallback } from "react";
import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext"; 
import { useLiveQuery } from "./useLiveQuery";
import type{ DashboardSummary } from "@business/shared-types";

export function useLiveDashboard(businessId: string | null | undefined, branchId: string | null | undefined) {
  const app = useApplication();

  const query = useCallback(async (): Promise<DashboardSummary | null> => {
    if (!businessId && !branchId) return null;

    return await app.dashboard.getSummary(businessId ?? "", branchId ?? "");
  }, [app, businessId, branchId]);

  return useLiveQuery<DashboardSummary>(
    ["ledger", "inventories", "sales"],
    query,
    null
  );
}