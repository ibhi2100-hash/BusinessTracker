import { create } from "zustand";
import { Branch } from "@/types/types";

interface BranchState {
  businessName: string;
  branches: Branch[];
  activeBranchId: string | null;

  setBranches: (branches: Branch[]) => void;

  setContext: (data: {
    businessName: string;
    branches: Branch[];
    activeBranchId?: string | null;
  }) => void;

  setActiveBranch: (id: string | null) => void;

  clear: () => void;
}

const initialState = {
  businessName: "",
  branches: [],
  activeBranchId: null,
};

export const useBranchStore = create<BranchState>((set) => ({
  ...initialState,

  setBranches: (branches: Branch[]) =>
    set(() => ({
      branches,
    })),

  setContext: ({
    businessName,
    branches,
    activeBranchId = null,
  }) =>
    set(() => ({
      businessName,
      branches,
      activeBranchId,
    })),

  setActiveBranch: (id: string | null) =>
    set(() => ({
      activeBranchId: id,
    })),

  clear: () =>
    set(() => ({
      ...initialState,
    })),
}));