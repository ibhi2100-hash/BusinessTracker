
import { useCallback } from "react";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "../useLiveQuery";

export type BusinessAlertSeverity =
  | "critical"
  | "warning"
  | "info";

export interface LiveBusinessAlert {
  id: string;
  title: string;
  description: string;
  branch: string;
  severity: BusinessAlertSeverity;
  type: "BRANCH_ATTENTION" | "LOW_STOCK";
}

export function useLiveBusinessAlerts(
  businessId: string | null | undefined
) {
  const app = useApplication();

  const query = useCallback(async (): Promise<LiveBusinessAlert[] | null> => {
    if (!businessId) return null;

    const branches =
      await app.businessDashboard.getBranchPerformance(businessId);

    if (!branches) return [];

    const alerts: LiveBusinessAlert[] = [];

    for (const branch of branches) {
      if (branch.status === "ATTENTION") {
        alerts.push({
          id: `${branch.id}-attention`,
          title: "Branch requires attention",
          description:
            "This branch has financial or operational indicators requiring review.",
          branch: branch.name,
          severity: "warning",
          type: "BRANCH_ATTENTION",
        });
      }

      if (Number(branch.outOfStockRows) > 0) {
        alerts.push({
          id: `${branch.id}-low-stock`,
          title: "Out-of-stock inventory detected",
          description:
            `${branch.outOfStockRows} inventory records have zero stock.`,
          branch: branch.name,
          severity: "warning",
          type: "LOW_STOCK",
        });
      }
    }

    return alerts;
  }, [app, businessId]);

  return useLiveQuery(
    [
      "ledger",
      "sales",
      "expenses",
      "employees",
      "branches",
      "branch_inventory",
    ],
    query,
    null
  );
}
