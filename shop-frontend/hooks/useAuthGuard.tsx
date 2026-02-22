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

  // Get both user and auth status
  const user = useAuthStore((state)=> state.user);
  const isAuthenticated = useAuthStore((state)=> state.isAuthenticated)

  useEffect(() => {
    // redirect if not logged in
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // redirect if adminOnly and user is not admin
    if (adminOnly && user?.role !== "ADMIN") {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, user, router, adminOnly]);

  // show nothing while redirecting
  if (!isAuthenticated || (adminOnly && user?.role !== "ADMIN")) {
    return null;
  }

  return <>{children}</>;
}