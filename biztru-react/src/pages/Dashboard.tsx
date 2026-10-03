"use client";
import { DashboardHeader } from "../components/DashboardComponent/DashboardHeader"; 
import { FinancialCarousel } from "../components/DashboardComponent/FinancialCarousel"; 
import { QuickActions } from "../components/DashboardComponent/QuickActions"; 



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