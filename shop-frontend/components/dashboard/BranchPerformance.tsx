import React from "react";
import { useAuthStore } from "@/store/useAuthStore";

export const BranchPerformance = () => {
  const { user } = useAuthStore();

  // Only business owner can view cross-branch performance
  if (!user || user.role !== "ADMIN") return null;

  const branches = [
    { name: "Ikeja", amount: "₦85,000" },
    { name: "Yaba", amount: "₦63,000" },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Branch Performance</h3>

      <div className="space-y-3">
        {branches.map((branch, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-2xl shadow flex justify-between"
          >
            <span>{branch.name}</span>
            <span className="font-semibold">{branch.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
};