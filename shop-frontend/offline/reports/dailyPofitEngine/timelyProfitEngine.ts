import { Accounts } from "@/offline/ledger/accounts";
import { getLedgerEntries } from "@/offline/ledger/ledgerQueryEngine";

export function calculateDailyProfit(entries:any[]) {

  const revenue = entries
    .filter(e => e.account === Accounts.REVENUE)
    .reduce((s,e)=> s + e.amount,0);

  const cogs = entries
    .filter(e => e.account === Accounts.COGS)
    .reduce((s,e)=> s + e.amount,0);

  const expenses = entries
    .filter(e => e.account === Accounts.EXPENSES)
    .reduce((s,e)=> s + e.amount,0);

  return {
    revenue,
    cogs,
    expenses,
    profit: revenue - cogs - expenses
  };
}

export async function generateMonthlyReport(branchId:string, year:number, month:number){

  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 0).getTime();

  const entries = await getLedgerEntries(branchId, start, end);

  return calculateDailyProfit(entries);
}

export function calculateInventoryValue(entries:any[]) {

  return entries
    .filter(e => e.account === Accounts.INVENTORY)
    .reduce((s,e)=> s + e.amount,0);
}

export function calculateCash(entries:any[]) {

  return entries
    .filter(e => e.account === Accounts.CASH)
    .reduce((s,e)=> s + e.amount,0);
}