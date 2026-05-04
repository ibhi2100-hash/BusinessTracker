import { liveQuery } from "dexie";
import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useBranchStore } from "@/src/store/useBranchStore";
import { useDashboardStore } from "@/src/store/DashboardStore";
import { Account } from "@/src/domain/ledger";

let subscription: any;

export function startDashboardSubscriber() {
  const userId = useAuthStore.getState().user?.id;
  const branchId = useBranchStore.getState().activeBranchId;

  if (!userId || !branchId) return;

  const db = getDb(userId);
  if (!db) return;

  subscription = liveQuery(async () => {
    const entries = await db.ledgerEntries
      .where("branchId")
      .equals(branchId)
      .toArray();


    let cash = 0;
    let revenue = 0;
    let expenses = 0;
    let inventory = 0;
    let liabilities = 0;
    let todaySales = 0;

    const today = new Date().toDateString();
for (const e of entries) {
  const isToday = new Date(e.createdAt).toDateString() === today;

  if (isToday && e.account === Account.REVENUE) {
    todaySales += e.direction === "CREDIT" ? e.amount : -e.amount;
  }

  switch (e.account) {
    case Account.CASH:
      cash += e.direction === "DEBIT" ? e.amount : -e.amount;
      break;

    case Account.REVENUE:
      revenue += e.direction === "CREDIT" ? e.amount : -e.amount;
      break;

    case Account.COGS:
      expenses += e.direction === "DEBIT" ? e.amount : -e.amount;
      console.log("This is the value of the expense of buying stock: ", expenses)
      break;

    case Account.INVENTORY:
      inventory += e.direction === "DEBIT" ? e.amount : -e.amount;
      break;

    case Account.LIABILITIES:
      liabilities += e.direction === "CREDIT" ? e.amount : -e.amount;
      break;
  }
}

  return {
    todaySales,
    cashAtHand: cash,
    inventoryValue: inventory,
    outstandingLiabilities: liabilities,
    netProfit:  revenue - expenses,
  };
  }).subscribe({
    next: (summary) => {
      useDashboardStore.getState().setSummary(summary);
    },
    error: (err) => {
      console.error("[DashboardSubscriber]", err);
    },
  });
}

export function stopDashboardSubscriber() {
  subscription?.unsubscribe?.();
}