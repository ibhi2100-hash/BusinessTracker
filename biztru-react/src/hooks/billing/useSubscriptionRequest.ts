
import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";

import type {
  BillingSubscriptionRequestRecord,
} from "../billing/api/billingplanApi";

export function useLiveBillingRequests(
  businessId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BillingSubscriptionRequestRecord[]> => {
      if (!businessId) return [];

      return app.billing.getSubscriptionRequests();
    },
    [app, businessId]
  );

  return useLiveQuery<BillingSubscriptionRequestRecord[]>(
    [
      "billing",
      "requests",
      businessId ?? "no-business",
    ],
    query,
    []
  );
}
