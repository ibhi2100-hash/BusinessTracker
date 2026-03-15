import { create } from "zustand";


interface BusinessStatusState {
    steps: {
        openingCash: boolean;
        inventory: boolean;
        assets: boolean;
        liabilities: boolean;
    },
    percentage: number;
    canActivate: boolean;
    isHydrated: boolean;
    setSteps: (steps: BusinessStatusState["steps"]) => void;
    setPercentage: (percentage: BusinessStatusState["percentage"])=> void;
    setCanActivate: (canActivate: BusinessStatusState["canActivate"])=> void;
    setIsHydrated: (isHydrated: BusinessStatusState["isHydrated"]) => void;
}
export const useBusinessStatusStore = create<BusinessStatusState>((set)=> ({
    steps: {
        openingCash: false,
        inventory: false,
        assets: false,
        liabilities: false,
    },
    percentage: 0,
    canActivate: false,
    isHydrated: false,
    setSteps: (steps) => set({ steps}),
    setPercentage: (percentage)=> set({ percentage}),
    setCanActivate: (canActivate)=> set({ canActivate}),
    setIsHydrated: (isHydrated) => set({ isHydrated })
}))