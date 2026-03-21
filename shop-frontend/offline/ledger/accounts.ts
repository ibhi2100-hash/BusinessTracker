export const AccountMeta = {
  CASH: { type: "ASSET" },
  INVENTORY: { type: "ASSET" },
  ASSETS: { type: "ASSET" },

  LIABILITIES: { type: "LIABILITY" },

  OWNER_CAPITAL: { type: "EQUITY" },
  OWNER_DRAWINGS: { type: "EQUITY" },

  REVENUE: { type: "REVENUE" },

  COGS: { type: "EXPENSE" },
  EXPENSES: { type: "EXPENSE" },

  INTER_BRANCH: { type: "EQUITY" } // internal clearing
} as const;



export enum Account {
  CASH = "CASH",
  INVENTORY = "INVENTORY",
  FIXED_ASSETS = "FIXED_ASSETS",

  LIABILITIES = "LIABILITIES",

  REVENUE = "REVENUE",
  COGS = "COGS",
  EXPENSES = "EXPENSES",

  OWNER_CAPITAL = "OWNER_CAPITAL",
  OWNER_DRAWINGS = "OWNER_DRAWINGS",

  INTER_BRANCH = "INTER_BRANCH"
}