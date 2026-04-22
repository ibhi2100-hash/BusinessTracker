"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import SheetRenderer from "./sheetRenderer";

type SheetType = "cart" | "addProduct" | null;

type SheetContextType = {
  sheet: SheetType;
  openSheet: (s: SheetType) => void;
  closeSheet: () => void;
};

const SheetContext = createContext<SheetContextType | null>(null);

export function SheetProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<SheetType>(null);

  const openSheet = useCallback((s: SheetType) => {
    setSheet(s);
  }, []);

  const closeSheet = useCallback(() => {
    setSheet(null);
  }, []);

  return (
    <SheetContext.Provider
      value={{
        sheet,
        openSheet,
        closeSheet,
      }}
    >
      {children}

      {/* GLOBAL SHEET LAYER */}
      <SheetRenderer sheet={sheet} close={closeSheet} />
    </SheetContext.Provider>
  );
}

export function useSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("useSheet must be used inside SheetProvider");
  return ctx;
}