import { Accounts } from "../../ledger/accounts";

export function generateProfitLoss(entries:any[]) {

  const revenue = entries
    .filter(e => e.account === Accounts.REVENUE)
    .reduce((sum,e)=> sum + e.amount,0)

  const cogs = entries
    .filter(e => e.account === Accounts.COGS)
    .reduce((sum,e)=> sum + e.amount,0)

  const expenses = entries
    .filter(e => e.account === Accounts.EXPENSES)
    .reduce((sum,e)=> sum + e.amount,0)

  const grossProfit = revenue - cogs
  const netProfit = grossProfit - expenses

  return {
    revenue,
    cogs,
    expenses,
    grossProfit,
    netProfit
  }
}