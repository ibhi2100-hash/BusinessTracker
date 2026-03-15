import { useBranchStore } from "@/store/useBranchStore";
import { getLedgerEntries } from "../ledger/ledgerQueryEngine";
import { calculateCash } from "../reports/dailyPofitEngine/timelyProfitEngine";
import { calculateInventoryValue } from "../reports/dailyPofitEngine/timelyProfitEngine";
import { calculateDailyProfit } from "../reports/dailyPofitEngine/timelyProfitEngine";


export async function generateBranchFinancialSummary(){

  const branchId = useBranchStore.getState().activeBranchId;

  const entries = await getLedgerEntries(branchId);

  return {

    cash: calculateCash(entries),

    inventoryValue: calculateInventoryValue(entries),

    profit: calculateDailyProfit(entries)

  };
}