// hooks/useAuthGuard.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore"; // store that holds user info

interface AuthGuardProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const router = useRouter();
  const hydrated = useAuthStore(state => state.hydrated);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (!hydrated) return; // wait until store is ready
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (adminOnly && user?.role !== "ADMIN") {
      router.replace("/unauthorized");
    }
  }, [hydrated, isAuthenticated, user, router, adminOnly]);

  if (!hydrated || !isAuthenticated || (adminOnly && user?.role !== "ADMIN")) {
    return null; // show loading or blank
  }

  return <>{children}</>;
}