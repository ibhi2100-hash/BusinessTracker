import { Account } from "@/offline/features/ledger/accounts";
import { getDb } from "../db";
import { useAuthStore } from "../store/useAuthStore";


export async function generateBranchFinancialSummary(branchId: string) {
    const userId = useAuthStore.getState().user.id;
    const db = await getDb(userId);
    
  const entries = await db.ledgerEntries
    .where("branchId")
    .equals(branchId)
    .toArray();

  let cash = 0;
  let revenue = 0;
  let expenses = 0;
  let inventory = 0;
  let liabilities = 0;

  for (const e of entries) {
    switch (e.account) {
      case Account.CASH:
        cash += e.amount;
        break;

      case Account.REVENUE:
        revenue += e.amount;
        break;

      case Account.EXPENSES:
      case Account.COGS:
        expenses += e.amount;
        break;

      case Account.INVENTORY:
        inventory += e.amount;
        break;

      case Account.LIABILITIES:
        liabilities += e.amount;
        break;
    }
  }

  return {
    cashAtHand: cash,
    inventoryValue: inventory,
    outstandingLiabilities: -liabilities,
    netProfit: -revenue - expenses,
  };
}