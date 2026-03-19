"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { appBootstrap } from "../offline/bootstrap/appBootstrap";
import { hydrateSetupStore } from "@/offline/finance/hydrateSetupStore";

export function useHydrateSetupStore() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const result = await hydrateSetupStore();
      console.log(" this is what i get by getting SetUpt Status ", result)

      // READY → stay on dashboard
    }

    init();
  }, [router]);
}