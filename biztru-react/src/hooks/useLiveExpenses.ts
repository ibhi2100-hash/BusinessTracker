
import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";

import type { Expense } from "@business/shared-types";

export function useLiveExpenses(
  businessId: string | null,
  branchId: string | null
) {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<Expense[]> => {
      if (!businessId || !branchId) {
        return [];
      }

      console.log("[LiveExpenses] Loading expenses", {
        businessId,
        branchId,
      });

      const expenses = await app.expense.listExpenses({
        businessId,
        branchId,
        status: "all",
        limit: 10,
        offset: 0,
      });

      console.log("[LiveExpenses] Loaded expenses", {
        count: expenses.length,
        expenses,
      });

      return expenses;
    },
    [app, businessId, branchId]
  );

  return useLiveQuery<Expense[]>(
    [
      "expenses",
      businessId ?? "no-business",
      branchId ?? "no-branch",
    ],
    query,
    []
  );
}
