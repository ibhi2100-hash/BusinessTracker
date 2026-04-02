"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusinessStore } from "@/store/businessStore";
import { useBranchStore } from "@/store/useBranchStore";
import { useDashboardFinancialData } from "@/hooks/dashboard/useDashboardfinancialData";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FinancialCarousel } from "@/components/dashboard/FinancialCarousel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BranchPerformance } from "@/components/dashboard/BranchPerformance";
import { AlertsSection } from "@/components/dashboard/AlertsSection";
import { useInitializeDashboard } from "@/hooks/dashboard/initializeddashboard";
import { generateBranchFinancialSummary } from "@/offline/dashboard/branchFinancialSummary";

const DashboardPage = () => {
    const activeBranchId  = useBranchStore(s => s.activeBranchId);

    useEffect(()=> {
      (async ()=> {
        try {
          const summary = await generateBranchFinancialSummary();
  
        } catch (err) {
          console.error("Failed to clear IndexedDb", err)
        }
      }
  
      )()
    }, [activeBranchId]);
        useEffect(() => {
          if (!activeBranchId) return;

          // safe logic
        }, [activeBranchId]);

    

  const businessFromStore = useBusinessStore((state) => state.business);
  const router = useRouter();

  useInitializeDashboard();

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