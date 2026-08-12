// src/context/BusinessContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

interface BusinessContextValue {
  businessId: string | null;
  branchId: string | null;
  setBranchId: (branchId: string) => Promise<void>;
  loading: boolean;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const app = useApplication();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [branchId, setBranchIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const ctx = await app.context.current()
        if (mounted) {
          setBusinessId(ctx.businessId ?? null);
          setBranchIdState(ctx.branchId ?? null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [app]);

  const setBranchId = async (newBranchId: string) => {
    await app.context.setActiveBranch(newBranchId);
    setBranchIdState(newBranchId);
  };

  return (
    <BusinessContext.Provider
      value={{ businessId, branchId, setBranchId, loading }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusinessContext must be used inside BusinessProvider");
  }
  return ctx;
}