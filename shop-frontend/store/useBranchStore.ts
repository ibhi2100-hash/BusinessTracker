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
  }) => void;

  setActiveBranch: (id: string) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  businessName: "",
  branches: [],
  activeBranchId: null,
  role: "STAFF",

  setContext: ({ businessName, branches, role }) =>
    set({
      businessName,
      branches,
      role,
      activeBranchId:
        typeof window !== "undefined"
          ? localStorage.getItem("activeBranchId") || branches?.[0]?.id || null
          : branches?.[0]?.id || null,
    }),

  setActiveBranch: (id) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeBranchId", id);
    }
    set({ activeBranchId: id });
  },
}));
