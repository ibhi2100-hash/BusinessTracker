export interface OwnerNavigationState {
  viewedBranchId: string | null;
  viewMode: "BUSINESS" | "BRANCH";
}

export interface OwnerNavigationContextValue {
  viewedBranchId: string | null;
  viewMode: "BUSINESS" | "BRANCH";

  viewBranch: (branchId: string) => void;
  viewBusiness: () => void;
}