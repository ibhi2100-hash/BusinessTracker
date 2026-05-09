type SnapshotMeta = {
  id: string;

  businessId: string;
  branchId?: string;

  version: number; // last applied event version
  eventCount: number;

  createdAt: number;

  checksum?: string;
};


type BusinessSnapshot = {
  meta: {
    snapshotId: string;

    businessId: string;
    branchId?: string;

    version: number;
    eventCount: number;

    createdAt: number;
  };

  financial: {
    todaySales: number;

    totalRevenue: number;
    totalExpenses: number;

    grossProfit: number;
    netProfit: number;

    cashAtHand: number;

    inventoryValue: number;

    outstandingLiabilities: number;
  };

  ledgerBalances: {
    CASH: number;
    INVENTORY: number;
    REVENUE: number;
    COGS: number;
    EXPENSE: number;
    LIABILITIES: number;
    OWNER_CAPITAL: number;
  };

  inventory: {
    products: Record<
      string,
      {
        id: string;

        name: string;

        quantity: number;

        costPrice: number;
        sellingPrice: number;

        inventoryValue: number;

        updatedAt: number;
      }
    >;
  };

  branches: {
    activeBranchId: string;

    list: {
      id: string;
      name: string;
    }[];
  };

  sync: {
    latestVersion: number;

    lastSyncedAt: number;
  };
};