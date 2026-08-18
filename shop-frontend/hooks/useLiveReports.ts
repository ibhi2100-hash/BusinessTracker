// hooks/useLiveReport.ts
import { useCallback } from "react";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useLiveQuery } from "./useLiveQuery";
import { ReportSummary, PeriodFilter } from "@business/shared-types";

export function useLiveReport(
  branchId: string | null,
  period: PeriodFilter | null
) {
  const app = useApplication();

  const query = useCallback(async (): Promise<ReportSummary> => {
    if (!branchId || !period) return null;
    return await app.report.getPeriodSummary(branchId, period);
  }, [app, branchId, period]);

  return useLiveQuery<ReportSummary | null>(
    ["ledger"],
    query,
    null
  );
}