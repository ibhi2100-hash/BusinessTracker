
import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";

import type {
  BillingLeaseRecord,
} from "../billing/api/billingplanApi";

export function useLiveBillingLease(
  businessId: string | null,
  branchId: string | null,
  deviceId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<BillingLeaseRecord | null> => {
      if (!businessId || !branchId || !deviceId) {
        return null;
      }

      return app.billing.getCurrentLease(
        branchId,
        deviceId
      );
    },
    [app, businessId, branchId, deviceId]
  );

  return useLiveQuery<BillingLeaseRecord | null>(
    [
      "billing",
      "lease",
      businessId ?? "no-business",
      branchId ?? "no-branch",
      deviceId ?? "no-device",
    ],
    query,
    null
  );
}
