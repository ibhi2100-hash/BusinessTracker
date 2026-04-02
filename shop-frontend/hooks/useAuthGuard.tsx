// hooks/useAuthGuard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStore } from "@/store/businessStore";

interface AuthGuardProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  blockIfOnboarding?: boolean; // NEW FLAG
}

export function AuthGuard({
  children,
  adminOnly = false,
  blockIfOnboarding = false,
}: AuthGuardProps) {
  const router = useRouter();

  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);

  const business = useBusinessStore.getState().business
  

  useEffect(() => {
    if (!hydrated) return;

    
    // Role check
    if (adminOnly && user?.role !== "ADMIN") {
      router.replace("/unauthorized");
      return;
    }

    // 🔒 Block dashboard access during onboarding
    if (blockIfOnboarding && business?.isOnboarding) {
      router.replace("/onboarding");
      return;
    }
  }, [
    hydrated,
    user,
    router,
    adminOnly,
    business,
    blockIfOnboarding,
  ]);

  // Prevent flashing content while checking
  if (
    !hydrated ||
    (adminOnly && user?.role !== "ADMIN") ||
    (blockIfOnboarding && business?.isOnboarding)
  ) {
    return null;
  }

  return <>{children}</>;
}