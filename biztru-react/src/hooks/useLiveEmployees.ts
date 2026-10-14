// hooks/useLiveEmployees.ts

import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";

import { useLiveQuery } from "./useLiveQuery";

import type { Employee } from "@business/shared-types";

export function useLiveEmployees(
  businessId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<Employee[] | null> => {
      if (!businessId) {
        return [];
      }

      // Replace this with the actual employee read contract.
      return app.employee.findBusinessEmployees(
        businessId
      );
    },
    [app, businessId]
  );

  return useLiveQuery<Employee[]>(
    ["employees", businessId ?? "no-business"],
    query,
    []
  );
}
