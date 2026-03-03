"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusinessStatus } from "@/hooks/useBusinessStatus";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { useDashboardFinancialData } from "@/hooks/financialData";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FinancialCarousel } from "@/components/dashboard/FinancialCarousel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BranchPerformance } from "@/components/dashboard/BranchPerformance";
import { AlertsSection } from "@/components/dashboard/AlertsSection";

const DashboardPage = () => {
  const businessFromStore = useBusinessStore((state) => state.business);
  const setBusiness = useBusinessStore((state) => state.setBusiness);
  const { data, isLoading } = useBusinessStatus();
  const router = useRouter();
  const { activeBranchId } = useBranchStore();

  // Always call hooks first
  useEffect(() => {
    if (data && !businessFromStore) {
      setBusiness(data);
    }
  }, [data, businessFromStore, setBusiness]);

  useEffect(() => {
    if (businessFromStore?.isOnboarding) {
      router.push("/onboard");
    }
  }, [businessFromStore, router]);

  // Financial data fetching
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  const startDate = lastWeek.toISOString().split("T")[0];
  const endDate = today.toISOString().split("T")[0];

  useDashboardFinancialData(startDate, endDate);

  // Early returns for UI
  if (isLoading && !businessFromStore) return <div>Loading...</div>;
  if (!businessFromStore) return <div>No business found. Please register.</div>;
  if (!activeBranchId) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <FinancialCarousel />
      <QuickActions />
      <BranchPerformance />
      <AlertsSection />
    </div>
  );
};

export default DashboardPage;