import BottomNav from "@/components/navigation/BottomNav";
import React from "react";
import LoadBusinessContext from "@/context/loadBusinessContext";
import { AuthGuard } from "@/hooks/useAuthGuard";

interface DashboardLayoutProps {
  children: React.ReactNode;
  adminOnly?: boolean; // optional flag for admin-only dashboards
}

export default function DashboardLayout({
  children,
  adminOnly = false,
}: DashboardLayoutProps) {
  return (
    <AuthGuard adminOnly={adminOnly}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 pb-20 px-4 pt-4">
          <LoadBusinessContext />
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}