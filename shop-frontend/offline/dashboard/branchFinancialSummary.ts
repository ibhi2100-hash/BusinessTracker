import { useBranchStore } from "@/store/useBranchStore";
import { getLedgerEntries } from "../ledger/ledgerQueryEngine";
import { calculateCash } from "../reports/dailyPofitEngine/timelyProfitEngine";
import { calculateInventoryValue } from "../reports/dailyPofitEngine/timelyProfitEngine";
import { calculateDailyProfit } from "../reports/dailyPofitEngine/timelyProfitEngine";
import { useFinancialStore } from "@/store/dashboardFinance";


export async function generateBranchFinancialSummary(){

  const branchId = useBranchStore.getState().activeBranchId;

  const entries = await getLedgerEntries(branchId);
  const cash = calculateCash(entries);
  const inventoryValue = calculateInventoryValue(entries);
  const profit = calculateDailyProfit(entries);

  const dashboardData = {
    cash,
    inventoryValue,
    profit
  }

  await useFinancialStore.getState().setBranchDashboardSummary(dashboardData)
  
  return {dashboardData};
}