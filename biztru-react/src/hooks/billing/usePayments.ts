
import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";

import type {
  BillingPaymentRecord,
} from "../billing/api/billingplanApi";

export function useLiveBillingPayments(
  businessId: string | null,
  status?: string
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BillingPaymentRecord[]> => {
      if (!businessId) return [];

      return app.billing.getPayments({
        status,
        limit: 100,
        offset: 0,
      });
    },
    [app, businessId, status]
  );

  return useLiveQuery<BillingPaymentRecord[]>(
    [
      "billing",
      "payments",
      businessId ?? "no-business",
      status ?? "all",
    ],
    query,
    []
  );
}
