import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Branch, BranchRole, BranchData } from "@/types/types";

interface BranchState {
  businessName: string;
  branches: Branch[];
  activeBranchId: string | null;
  role: BranchRole;
  branchData: Record<string, BranchData>;
  hydrated: boolean;

  setBranches: (branches: Branch[]) => void;
  setContext: (data: {
    businessName: string;
    branches: Branch[];
    role: BranchRole;
    activeBranchId?: string;
  }) => void;
  setActiveBranch: (id: string) => void;
  setBranchData: (branchId: string, data: BranchData) => void;
  setHydrated: () => void;

  clear: () => void;
  
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      businessName: "",
      branches: [],
      activeBranchId: null,
      role: "STAFF",
      branchData: {},
      hydrated: false,

      setBranches: (branches) => {
        const store = get();
        set({
          branches,
          activeBranchId: store.activeBranchId ?? branches?.[0]?.id ?? null,
        });
      },

      setContext: ({ businessName, branches, role, activeBranchId }) => {
        set({
          businessName,
          branches,
          role,
          activeBranchId: activeBranchId ?? branches?.[0]?.id ?? null,
        });
      },

      setActiveBranch: (id) => set({ activeBranchId: id }),

      setBranchData: (branchId, data) =>
        set((state) => ({
          branchData: { ...state.branchData, [branchId]: data },
        })),

      setHydrated: () => set({ hydrated: true }),

      clear: () =>
        set({
          businessName: "",
          branches: [],
          activeBranchId: null,
          role: "STAFF",
          branchData: {},
        }),
    }),
    {
      name: "branch-storage",
      partialize: (state) => ({
        businessName: state.businessName,
        branches: state.branches,
        activeBranchId: state.activeBranchId,
        role: state.role,
        branchData: state.branchData,
      }),
    }
  )
);