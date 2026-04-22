import { getBranchLedger } from "../../features/ledger/ledgerEntriesByBranch"
import { generateBalanceSheet } from "../../features/reports/actions/balanceSheet"
import { generateCashflow } from "../../reports/cashflowStatement/cashflowStatement"
import { generateProfitLoss } from "../../reports/profit&loss/profit&loss"


export async function generateFinancialSummary(branchId:string){

  const entries = await getBranchLedger(branchId)

  return {

    profitLoss: generateProfitLoss(entries),

    balanceSheet: generateBalanceSheet(entries),

    cashflow: generateCashflow(entries)

  }
}