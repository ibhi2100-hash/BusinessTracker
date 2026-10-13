// hooks/useLiveEmployees.ts

import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";

import { useLiveQuery } from "./useLiveQuery";

import type { StaffMember } from "../components/employeeComponent/StaffCard";

export function useLiveEmployees(
  businessId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<StaffMember[]> => {
      if (!businessId) {
        return [];
      }

      // Replace this with the actual employee read contract.
      return app.employee.findAllBusinessEmployees(
        businessId
      );
    },
    [app, businessId]
  );

  return useLiveQuery<StaffMember[]>(
    ["employees", businessId ?? "no-business"],
    query,
    []
  );
}
