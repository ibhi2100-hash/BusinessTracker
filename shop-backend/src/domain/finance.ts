type FinancialState = {
  todaySales: number;

  totalRevenue: number;
  totalExpenses: number;

  grossProfit: number;
  netProfit: number;

  cashAtHand: number;

  inventoryValue: number;

  outstandingLiabilities: number;

  ownerCapital: number;

  totalAssets: number;
};

type LedgerBalances = {
  CASH: number;
  BANK: number;

  INVENTORY: number;

  REVENUE: number;
  COGS: number;
  EXPENSE: number;

  LIABILITIES: number;

  OWNER_CAPITAL: number;
  OWNER_DRAWINGS: number;

  FIXED_ASSETS: number;

  INTER_BRANCH: number;
};