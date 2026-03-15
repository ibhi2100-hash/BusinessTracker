import { Accounts } from "../../ledger/accounts";

export function generateBalanceSheet(entries:any[]) {

  const sum = (account:string) =>
    entries
      .filter(e=> e.account === account)
      .reduce((s,e)=> s + e.amount,0)

  const cash = sum(Accounts.CASH)
  const inventory = sum(Accounts.INVENTORY)
  const assets = sum(Accounts.ASSETS)

  const liabilities = sum(Accounts.LIABILITIES)

  const revenue = sum(Accounts.REVENUE)
  const cogs = sum(Accounts.COGS)
  const expenses = sum(Accounts.EXPENSES)

  const equity = revenue - cogs - expenses

  return {

    assets:{
      cash,
      inventory,
      assets,
      total: cash + inventory + assets
    },

    liabilities:{
      liabilities
    },

    equity:{
      retainedEarnings: equity
    }

  }
}