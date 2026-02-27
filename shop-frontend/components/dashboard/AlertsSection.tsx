"use client";

import React from "react";
import { useBranchStore } from "@/store/useBranchStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useBranchAlerts } from "@/hooks/useBranchAlerts";
import { AlertTriangle, Info, Bell } from "lucide-react";

export const AlertsSection = () => {
  const { user } = useAuthStore();
  const { activeBranchId } = useBranchStore();

  // Branch manager → fixed branch
  const branchId =
    user?.role === "ADMIN" ? user.branchId : activeBranchId;

  const { data: alerts, isLoading } = useBranchAlerts(branchId);

  if (!branchId) return null;

  return (
    <div>
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Alerts
      </h3>

      {/* Loading */}
      {isLoading && (
        <div className="text-sm text-gray-500">Loading alerts...</div>
      )}

      {/* Empty State */}
      {!isLoading && alerts?.length === 0 && (
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
          No alerts for this branch 🎉
        </div>
      )}

      <div className="space-y-2">
        {alerts?.map((alert: any) => (
          <div
            key={alert.id}
            className={`p-3 rounded-xl text-sm flex gap-2 items-start
              ${
                alert.severity === "HIGH"
                  ? "bg-red-50 text-red-700"
                  : alert.severity === "MEDIUM"
                  ? "bg-yellow-50 text-yellow-800"
                  : "bg-blue-50 text-blue-800"
              }`}
          >
            {alert.severity === "HIGH" ? (
              <AlertTriangle className="w-4 h-4 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 mt-0.5" />
            )}
            <span>{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};