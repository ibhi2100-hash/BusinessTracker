// hooks/useLiveProducts.ts

import { useCallback } from "react";

import { useApplication } 
  from "../Biztru/services/ApplicationService/ApplicationContext";

import { useLiveQuery } 
  from "./useLiveQuery";

import type { Business } 
  from "@business/shared-types";


export function useBusinessLiveQuery(
  businessId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<Business | null> => {

      if (!businessId) {
        return null;
      }

      return await app.business.CurrentBusiness(
        businessId
      );
    },
    [app, businessId]
  );
 if(!businessId){
  throw new Error("this is the businessId")
 }

 if(!query){
  throw new Error("")
 }
  return useLiveQuery<Business>(
    ["businesses", businessId],
    query,
    null
  );
}
