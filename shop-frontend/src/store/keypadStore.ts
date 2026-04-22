import { create } from "zustand";
import { usePOSStore } from "./usePOSStore";

type KeypadMode = "QUANTITY" | "PRICE";

type KeypadState = {
  value: string; // string for safe typing
  mode: KeypadMode;
  activeProductId?: string;

  input: (digit: string) => void;
  backspace: () => void;
  clear: () => void;

  attachToProduct: (productId: string, mode: KeypadMode) => void;
  apply: () => void;
};

export const useKeypadStore = create<KeypadState>((set, get) => ({
  value: "",
  mode: "QUANTITY",
  activeProductId: undefined,

  input: (digit) =>
    set((state) => ({
      value: state.value === "0" ? digit : state.value + digit,
    })),

  backspace: () =>
    set((state) => ({
      value: state.value.slice(0, -1),
    })),

  clear: () => set({ value: "" }),

  attachToProduct: (productId, mode) =>
    set({
      activeProductId: productId,
      mode,
      value: "",
    }),

  apply: () => {
    const { value, mode, activeProductId } = get();
    if (!activeProductId || !value) return;

    const num = Number(value);

    const { updateQuantity, updatePrice } =
      usePOSStore.getState();

    if (mode === "QUANTITY") {
      updateQuantity(activeProductId, num);
    } else {
      updatePrice(activeProductId, num * 100); // convert to kobo
    }

    set({ value: "" });
  },
}));