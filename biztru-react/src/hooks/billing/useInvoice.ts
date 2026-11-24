
import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";

import type {
  BillingInvoiceRecord,
} from "../billing/api/billingplanApi";

export function useLiveBillingInvoices(
  businessId: string | null,
  options?: {
    status?: string;
    from?: number;
    to?: number;
    limit?: number;
  }
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BillingInvoiceRecord[]> => {
      if (!businessId) return [];

      return app.billing.getInvoices({
        status: options?.status,
        from: options?.from,
        to: options?.to,
        limit: options?.limit ?? 100,
        offset: 0,
      });
    },
    [
      app,
      businessId,
      options?.status,
      options?.from,
      options?.to,
      options?.limit,
    ]
  );

  return useLiveQuery<BillingInvoiceRecord[]>(
    [
      "billing",
      "invoices",
      businessId ?? "no-business",
      options?.status ?? "all",
      String(options?.from ?? ""),
      String(options?.to ?? ""),
      String(options?.limit ?? 100),
    ],
    query,
    []
  );
}
