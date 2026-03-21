"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hydrateSetupStore } from "@/offline/finance/hydrateSetupStore";

export function useHydrateSetupStore() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const result = await hydrateSetupStore();

      // READY → stay on dashboard
    }

    init();
  }, [router]);
}