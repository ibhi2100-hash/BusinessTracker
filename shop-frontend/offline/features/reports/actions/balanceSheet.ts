import { Account } from "../../ledger/accounts";

export function generateBalanceSheet(entries:any[]) {

  const sum = (account:string) =>
    entries
      .filter(e=> e.account === account)
      .reduce((s,e)=> s + e.amount,0)

  const cash = sum(Account.CASH)
  const inventory = sum(Account.INVENTORY)
  const assets = sum(Account.FIXED_ASSETS)

  const liabilities = sum(Account.LIABILITIES)

  const revenue = sum(Account.REVENUE)
  const cogs = sum(Account.COGS)
  const expenses = sum(Account.EXPENSES)

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