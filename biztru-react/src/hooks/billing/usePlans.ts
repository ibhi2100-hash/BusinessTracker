
import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";

import type {
  BillingPlanRecord,
  BillingPlanVersionRecord,
} from "../billing/api/billingplanApi";

export function useLiveBillingPlans() {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BillingPlanRecord[]> => {
      return app.billing.getPlans();
    },
    [app]
  );

  return useLiveQuery<BillingPlanRecord[]>(
    ["billing", "plans"],
    query,
    []
  );
}

export function useLiveBillingPlanVersions(
  planId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BillingPlanVersionRecord[]> => {
      if (!planId) return [];

      return app.billing.getPlanVersions(planId);
    },
    [app, planId]
  );

  return useLiveQuery<BillingPlanVersionRecord[]>(
    [
      "billing",
      "plan-versions",
      planId ?? "no-plan",
    ],
    query,
    []
  );
}
