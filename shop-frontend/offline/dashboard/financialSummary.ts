import { getBranchLedger } from "../ledger/ledgerEntriesByBranch"
import { generateBalanceSheet } from "../reports/balanceSheet/balanceSheet"
import { generateCashflow } from "../reports/cashflowStatement/cashflowStatement"
import { generateProfitLoss } from "../reports/profit&loss/profit&loss"


export async function generateFinancialSummary(branchId:string){

  const entries = await getBranchLedger(branchId)

  return {

    profitLoss: generateProfitLoss(entries),

    balanceSheet: generateBalanceSheet(entries),

    cashflow: generateCashflow(entries)

  }
}