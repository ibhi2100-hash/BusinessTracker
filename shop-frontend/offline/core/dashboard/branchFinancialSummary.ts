import { useBranchStore } from "@/src/store/useBranchStore";
import { getLedgerEntries } from "../../features/ledger/ledgerQueryEngine";
import { calculateCash } from "../../features/reports/actions/timelyProfitEngine";
import { calculateInventoryValue } from "../../features/reports/actions/timelyProfitEngine";
import { calculateDailyProfit } from "../../features/reports/actions/timelyProfitEngine";
import { useFinancialStore } from "@/src/store/useFinanceStore";


export async function generateBranchFinancialSummary(){

  const branchId = useBranchStore.getState().activeBranchId;

  const entries = await getLedgerEntries(branchId);
  const cashAtHand = calculateCash(entries);
  const inventoryValue = calculateInventoryValue(entries);
  const netProfit = calculateDailyProfit(entries);
  const todaySales = 0;
  const outstandingLiabilities = 0;

  const dashboardData = {
    todaySales,
    cashAtHand,
    netProfit,
    inventoryValue,
    outstandingLiabilities
  }

  useFinancialStore.getState().setDashboardSummary(dashboardData)
  
  return {dashboardData};
}