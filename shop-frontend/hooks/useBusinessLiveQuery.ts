// hooks/useLiveProducts.ts
import { useCallback } from "react";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";
import { LiveProduct } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";
import { Business } from "@business/shared-types";

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