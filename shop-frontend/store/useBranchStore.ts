import { create } from "zustand";

interface Branch {
  id: string;
  name: string;
}

interface BranchState { 
  businessName: string;
  branches: Branch[];
  activeBranchId: string | null;
  role: "ADMIN" | "STAFF";

  setContext: (data: {
    businessName: string;
    branches: Branch[];
    role: "ADMIN" | "STAFF";
    activeBranchId: string;
  }) => void;

  setActiveBranch: (id: string) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  businessName: "",
  branches: [],
  activeBranchId: null,
  branchTokens: {},
  branchData: {},
  role: "STAFF",


setContext: ({ businessName, branches, role }) =>
  set((state) => ({
    businessName,
    branches,
    role,
    activeBranchId:
      state.activeBranchId || branches?.[0]?.id || null, // don't overwrite if undefined
  })),

  setActiveBranch: (id) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeBranchId", id);
    }
    set({ activeBranchId: id });
  },
}));
