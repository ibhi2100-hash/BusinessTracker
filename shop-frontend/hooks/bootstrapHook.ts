"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { appBootstrap } from "../offline/bootstrap/appBootstrap";

export function useAppBootstrap() {
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const result = await appBootstrap();

      if (result === "NO_SESSION") {
        router.replace("/login");
        return;
      }

      if (result === "NO_BUSINESS") {
        router.replace("/onboarding");
        return;
      }

      // READY → stay on dashboard
    }

    init();
  }, [router]);
}