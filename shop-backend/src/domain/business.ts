type BranchSnapshot = {
  activeBranchId: string;

  branches: {
    id: string;
    name: string;

    cashBalance: number;

    inventoryValue: number;
  }[];
};