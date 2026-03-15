import { create } from "zustand";
import { Branch, BranchRole, BranchData, Role } from "@/types/types";

interface BranchState {
  businessName: string;
  branches: Branch[];
  activeBranchId: string | null;
  role: Role;
  branchData: Record<string, BranchData>;

  setBranches: (branches: Branch[])=> void
  setContext: (data: {
    businessName: string;
    branches: Branch[];
    role: BranchRole;
    activeBranchId?: string;
  }) => void;

  setActiveBranch: (id: string) => void;
  setBranchData: (branchId: string, data: BranchData) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  businessName: "",
  branches: [],
  activeBranchId: null,
  role: "STAFF",
  branchData: {},
  
  setBranches: (branches)=> set({branches}),

  setContext: ({ businessName, branches, role, activeBranchId }) =>
    set({
      businessName,
      branches,
      role,
      activeBranchId: activeBranchId ?? branches?.[0]?.id ?? null,
    }),

  setActiveBranch: (id) => {
    if (typeof window !== "undefined") localStorage.setItem("activeBranchId", id);
    set({ activeBranchId: id });
  },

  setBranchData: (branchId, data) =>
    set((state) => ({ branchData: { ...state.branchData, [branchId]: data } })),
}));