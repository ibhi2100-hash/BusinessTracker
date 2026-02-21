import { create } from 'zustand';
import { BranchStore, Branch, BranchData } from '@/types/branchTypes';

export const useBranchStore = create<BranchStore>((set)=> ({
    activeBranchId: null,
    branchTokens: {},
    branchData: {},
    setActiveBranch: (branch: Branch)=> set((state)=> ({
        activeBranchId: branch.id,
        branchTokens: { ...state.branchTokens, [branch.id]: branch.token},

    })),
    setBranchData: (branchId: string, data: BranchData)=> set((state)=> ({
        branchData: {...state.branchData, [branchId]: data}
    }))

}))