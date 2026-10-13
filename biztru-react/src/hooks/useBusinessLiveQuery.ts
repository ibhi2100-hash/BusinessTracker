
import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";

import type { Business } from "@business/shared-types";

export function useBusinessLiveQuery(
  businessId: string | null | undefined
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<Business | null> => {
      if (!businessId) {
        return null;
      }

      return app.business.CurrentBusiness(businessId);
    },
    [app, businessId]
  );

  return useLiveQuery<Business>(
    ["businesses", businessId ?? "pending"],
    query,
    null
  );
}
