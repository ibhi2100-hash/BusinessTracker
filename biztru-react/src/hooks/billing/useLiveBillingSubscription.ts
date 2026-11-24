
import { useCallback } from "react";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext"; 
import { useLiveQuery } from "../useLiveQuery"; 

import type { BillingSubscriptionRecord } from "../../Biztru/services/ApplicationService/API/billing/billingplanApi"; 

export function useLiveBillingSubscription(
  businessId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BillingSubscriptionRecord | null> => {
      if (!businessId) return null;

      return app.billing.getSubscription();
    },
    [app, businessId]
  );

  return useLiveQuery<BillingSubscriptionRecord | null>(
    [
      "billing",
      "subscription",
      businessId ?? "no-business",
    ],
    query,
    null
  );
}
