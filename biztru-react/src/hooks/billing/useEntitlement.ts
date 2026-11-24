
import { useCallback } from "react";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext"; 
import { useLiveQuery } from "../useLiveQuery"; 

import type { BillingEntitlementRecord } from "../../Biztru/services/ApplicationService/API/billing/billingplanApi";

export function useLiveBillingEntitlements(
  businessId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BillingEntitlementRecord[]> => {
      if (!businessId) return [];

      return app.billing.getEntitlements();
    },
    [app, businessId]
  );

  return useLiveQuery<BillingEntitlementRecord[]>(
    [
      "billing",
      "entitlements",
      businessId ?? "no-business",
    ],
    query,
    []
  );
}
