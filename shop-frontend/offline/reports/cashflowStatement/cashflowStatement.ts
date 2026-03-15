import { Accounts } from "../../ledger/accounts";

export function generateCashflow(entries:any[]) {

  const cashEntries = entries.filter(
    e => e.account === Accounts.CASH
  )

  const inflow = cashEntries
    .filter(e=> e.amount > 0)
    .reduce((s,e)=> s + e.amount,0)

  const outflow = cashEntries
    .filter(e=> e.amount < 0)
    .reduce((s,e)=> s + Math.abs(e.amount),0)

  return {
    inflow,
    outflow,
    netCash: inflow - outflow
  }
}