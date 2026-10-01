// hooks/useLiveProducts.ts
import { useCallback } from "react";
import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";
import type{ Business } from "@business/shared-types";

export function useBusinessLiveQuery(businessId: string | null) {
  const app = useApplication();

  const query = useCallback(async (): Promise<Business> => {
    if (!businessId) return;
    return await app.business.CurrentBusiness(businessId)
  }, [app, businessId]);

  return useLiveQuery<Business>(
    ["businesses"],
    query,
    null
  );
}