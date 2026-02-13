"use client";

import { useDashboardSummary } from "@/features/dashboard/useDashboard";
import { Card } from "../Card/Card";

export function FinancialCarousel() {
  const { data, isLoading } = useDashboardSummary();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto">
      
    </div>
  );
}

