"use client";

import { useAppBootstrap } from "@/hooks/bootstrapHook";
import { useAuthStore } from "@/store/useAuthStore";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const ready = useAppBootstrap();

  // 1️⃣ Wait for persist hydration
  if (!hydrated) {
    return <div>Loading app...</div>;
  }

  // 2️⃣ Wait for bootstrap
  if (!ready) {
    return <div>Initializing...</div>;
  }

  // 3️⃣ Safe render
  return <>{children}</>;
}