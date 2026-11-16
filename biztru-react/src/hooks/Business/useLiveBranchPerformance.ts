
import { useCallback } from "react";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "../useLiveQuery";
import type { PeriodFilter } from "@business/shared-types";

export function useLiveBranchPerformance(
  businessId: string | null | undefined,
  period?: PeriodFilter
) {
  const app = useApplication();

  const query = useCallback(async () => {
    if (!businessId) return null;

    return app.businessDashboard.getBranchPerformance(
      businessId,
      period
    );
  }, [app, businessId, period]);

  return useLiveQuery(
    [
      "ledger",
      "sales",
      "employees",
      "branches",
      "branch_inventory",
    ],
    query,
    null
  );
}
