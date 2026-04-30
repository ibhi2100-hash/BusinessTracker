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
export type EntryType =
  | "SALE"
  | "PURCHASE"
  | "EXPENSE"
  | "LIABILITY"
  | "REPAYMENT"
  | "CAPITAL_IN"
  | "CAPITAL_OUT"
  | "ADJUSTMENT";

export interface LedgerEntry {
  id: string;

  // linkage
  eventId: string;
  businessId: string;
  branchId: string;

  // classification (for reporting only)
  type: EntryType;

  // accounting core
  account: Account;
  direction: "DEBIT" | "CREDIT";
  amount: number; // ALWAYS POSITIVE

  // ordering
  index: number; // position inside event

  createdAt: number;
}


export type AccountGroup =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "REVENUE"
  | "EXPENSE";

 export const ACCOUNT_GROUP: Record<Account, AccountGroup> = {
  CASH: "ASSET",
  BANK: "ASSET",
  INVENTORY: "ASSET",
  FIXED_ASSETS: "ASSET",

  LIABILITIES: "LIABILITY",

  OWNER_CAPITAL: "EQUITY",
  OWNER_DRAWINGS: "EQUITY",

  REVENUE: "REVENUE",

  EXPENSE: "EXPENSE",
  COGS: "EXPENSE",

  INTER_BRANCH: "ASSET",
}; 