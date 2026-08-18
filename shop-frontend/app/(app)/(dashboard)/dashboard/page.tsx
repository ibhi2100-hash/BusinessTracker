"use client";
import { DashboardHeader } from "@/app/(app)/(dashboard)/dashboard/components/DashboardHeader";
import { FinancialCarousel } from "@/app/(app)/(dashboard)/dashboard/components/FinancialCarousel";
import { QuickActions } from "@/app/(app)/(dashboard)/dashboard/components/QuickActions";



const DashboardPage = () => {
  return (
  <div
    className="
      px-4
      pb-24
      space-y-6
    "
  >
    <DashboardHeader />

    <section>
      <FinancialCarousel />
    </section>

    <section>
      <QuickActions />
    </section>
  </div>
);
};

export default DashboardPage;