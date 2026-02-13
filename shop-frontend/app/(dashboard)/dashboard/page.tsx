"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FinancialCarousel } from "@/components/dashboard/FinancialCarousel";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BranchPerformance } from "@/components/dashboard/BranchPerformance";
import { AlertsSection } from "@/components/dashboard/AlertsSection";
import { useAuth } from "@/features/auth/useAuth";


const DashboardPage = () => {
    const { data: user } = useAuth()
    return(
        <div className="space-y-6">
            <DashboardHeader />
            <FinancialCarousel />
            <QuickActions />
            <BranchPerformance />
            <AlertsSection />
        </div>
    )
}

export default DashboardPage;