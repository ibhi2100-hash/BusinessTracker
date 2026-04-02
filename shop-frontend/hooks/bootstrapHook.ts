"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { hydrateStoresFromDB } from "@/offline/hydration/hydrateStoresFromDB";


export function useAppBootstrap() {
  const router = useRouter();
  const hydrated = useAuthStore(s => s.hydrated)
  const checkTokenValid = useAuthStore(s => s.checkTokenValid)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      // 1️⃣ Wait for Zustand persist hydration
      if (!hydrated) return;

      // 2️⃣ Sync IndexedDB → Zustand
      await hydrateStoresFromDB();

      // 3️⃣ Auth check
      const isValid = checkTokenValid();
      console.log("This is the validity Check", isValid)

      // 4️⃣ Route decision
      if (!isValid) {
        router.replace("/login");
      }

      if (mounted) setReady(true);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [hydrated]);

  return ready;
}