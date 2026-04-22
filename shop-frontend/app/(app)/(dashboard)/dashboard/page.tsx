"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";

import { DashboardHeader } from "@/app/(app)/(dashboard)/dashboard/components/DashboardHeader";
import { FinancialCarousel } from "@/app/(app)/(dashboard)/dashboard/components/FinancialCarousel";
import { QuickActions } from "@/app/(app)/(dashboard)/dashboard/components/QuickActions";
import { generateBranchFinancialSummary } from "@/offline/core/dashboard/branchFinancialSummary";

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
/*
  useEffect(() => {
    if (businessFromStore?.isOnboarding) {
      router.push("/onboard");
    }
  }, [businessFromStore, router]);

  */
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
    </div>
  );
};

export default DashboardPage;