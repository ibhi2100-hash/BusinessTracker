// hooks/useAuthGuard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useBusinessStatus } from "@/hooks/useBusinessStatus";

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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const { data: business, isLoading: businessLoading } = useBusinessStatus();

  useEffect(() => {
    if (!hydrated || businessLoading) return;

    // Not logged in
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

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
    isAuthenticated,
    user,
    router,
    adminOnly,
    business,
    businessLoading,
    blockIfOnboarding,
  ]);

  // Prevent flashing content while checking
  if (
    !hydrated ||
    !isAuthenticated ||
    businessLoading ||
    (adminOnly && user?.role !== "ADMIN") ||
    (blockIfOnboarding && business?.isOnboarding)
  ) {
    return null;
  }

  return <>{children}</>;
}