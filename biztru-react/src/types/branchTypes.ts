export interface Branch{
    id: string;
    name: string;
    token: string;
}

export interface BranchData {
    sales: number;
    stock: Record<string, number>;
    expenses: number;
    profit: number;
    [key: string]: any;
}
export interface BranchStore {
    activeBranchId: string | null;
    branchTokens: Record<string, string>;
    branchData: Record<string, BranchData>;
    setActiveBranch: (Branch: Branch)=> void;
    setBranchData: (branchId: string, data: BranchData)=> void;
}