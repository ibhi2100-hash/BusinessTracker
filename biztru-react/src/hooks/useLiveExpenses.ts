// hooks/useLiveEmployees.ts

import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";

import { useLiveQuery } from "./useLiveQuery";

import type { Employee, Expense } from "@business/shared-types";

export function useLiveExpenses(
  branchId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<Expense[] | null> => {
      if (!branchId) {
        return [];
      }

      // Replace this with the actual employee read contract.
      return app.expense.getExpenseByBranch(
        branchId
      );
    },
    [app, branchId]
  );

  return useLiveQuery<Expense[]>(
    ["employees", branchId ?? "no-branch"],
    query,
    []
  );
}
