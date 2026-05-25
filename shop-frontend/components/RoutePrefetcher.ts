// components/RoutePrefetcher.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/inventory");
    router.prefetch("/sales");
  }, []);

  return null;
}