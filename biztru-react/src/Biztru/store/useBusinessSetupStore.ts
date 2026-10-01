import { create } from "zustand";

interface SetupState {
  hasOpeningCash: boolean;
  hasInventory: boolean;
  hasAssets: boolean;
  hasLiabilities: boolean;

  setStep: (step: keyof SetupState, value: boolean) => void;
}

export const useBusinessSetupStore = create<SetupState>((set) => ({
  hasOpeningCash: false,
  hasInventory: false,
  hasAssets: false,
  hasLiabilities: false,

  setStep: (step, value) =>
    set((state) => ({
      ...state,
      [step]: value,
    })),
}));