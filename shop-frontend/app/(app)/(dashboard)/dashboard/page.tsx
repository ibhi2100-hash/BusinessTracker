"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusinessStore } from "@/src/store/businessStore";
import { useBranchStore } from "@/src/store/useBranchStore";

import { DashboardHeader } from "@/app/(app)/(dashboard)/dashboard/components/DashboardHeader";
import { FinancialCarousel } from "@/app/(app)/(dashboard)/dashboard/components/FinancialCarousel";
import { QuickActions } from "@/app/(app)/(dashboard)/dashboard/components/QuickActions";
import { startDashboardSubscriber } from "@/offline/subscribers/dashboardSubscriber";
import { stopDashboardSubscriber } from "@/offline/subscribers/dashboardSubscriber";



const DashboardPage = () => {
    const activeBranchId  = useBranchStore(s => s.activeBranchId);
        useEffect(() => {
          startDashboardSubscriber();
          return () => stopDashboardSubscriber();
        }, []);
        useEffect(() => {
          if (!activeBranchId) return;

          // safe logic
        }, [activeBranchId]);

    

  const businessFromStore = useBusinessStore((state) => state.business);
  const router = useRouter();

  useEffect(() => {
    if (businessFromStore?.isOnboarding) {
      router.push("/onboard");
    }
  }, [businessFromStore, router]);

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <FinancialCarousel />
      <QuickActions />
    </div>
  );
};

export default DashboardPage;