export enum Account {
  CASH = "CASH",
  BANK = "BANK",
  INVENTORY = "INVENTORY",
  COGS = "COGS",
  REVENUE = "REVENUE",
  EXPENSE = "EXPENSE",
  LIABILITIES = "LIABILITIES",
  OWNER_CAPITAL = "OWNER_CAPITAL",
  OWNER_DRAWINGS = "OWNER_DRAWINGS",
  FIXED_ASSETS = "FIXED_ASSETS",
  INTER_BRANCH = "INTER_BRANCH",
}

export interface LedgerEntry {
  id: string;
  eventId: string;
  businessId: string;
  branchId: string;
  type: string;
  account: Account;
  direction: "DEBIT" | "CREDIT";
  amount: number;
  index: number;
  createdAt: number;
}