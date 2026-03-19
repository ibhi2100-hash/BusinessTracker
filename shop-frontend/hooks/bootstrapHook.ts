"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appBootstrap } from "../offline/bootstrap/appBootstrap";

export function useAppBootstrap() {
  const router = useRouter();
  const [ready, setReady ] = useState(false)

  useEffect(() => {
    async function init() {
      const result = await appBootstrap();

      if (result === "NO_SESSION") {
        router.replace("/login");
        return;
      }

      if (result === "NO_BUSINESS") {
        router.replace("/onboard");
        return;
      }

      setReady(true)
    }

    init();
  }, [router]);

  return ready
}