// hooks/useBranches.ts

import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";

import { useLiveQuery } from "./useLiveQuery";

import type { Branch } from "@business/shared-types";

export function useBranchLiveQuery(
  businessId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<Branch[] | null> => {
      if (!businessId) {
        return [];
      }

      return app.branch.findAllBusinessBranches(
        businessId
      );
    },
    [app, businessId]
  );

  return useLiveQuery<Branch[]>(
    ["branches", businessId ?? "no-business"],
    query,
    []
  );
}
