"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appBootstrap } from "@/offline/bootstrap/appBootstrap";

export function useAppBootstrap() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const ok = await appBootstrap(router);

      if (mounted && ok) {
        setReady(true);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return ready;
}