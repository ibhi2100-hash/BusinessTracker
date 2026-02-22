"use client";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FinancialCarousel } from "@/components/dashboard/FinancialCarousel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BranchPerformance } from "@/components/dashboard/BranchPerformance";
import { AlertsSection } from "@/components/dashboard/AlertsSection";
import { useBranchStore } from "@/store/useBranchStore";
import { useDashboardFinancialData } from "@/hooks/financialData";

const DashboardPage = () => {
  // Get the active branch ID from your branch store
  const { activeBranchId } = useBranchStore();

  // Trigger fetching all financial data
  // Make sure to pass startDate and endDate (e.g., today)
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  useDashboardFinancialData(today, today);

  
  // If branch is not yet selected, show a loading state
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