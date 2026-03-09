"use client";

import { useState } from "react";
import { useLiabilities } from "@/hooks/liabilitiesHooks/useLiabilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RepayLiabilityModal } from "./RepayLiabilityModal";

export const LiabilityList = () => {
  const { data, isLoading } = useLiabilities();
  const [selected, setSelected] = useState<string | null>(null);

  if (isLoading) return <p className="text-center text-gray-500">Loading liabilities...</p>;
  if (!data?.length)
    return (
      <Card className="p-6 text-center text-sm text-gray-500">
        No liabilities recorded.
      </Card>
    );

  return (
    <div className="space-y-4">
      {data.map((liability) => {
        const repaid = liability.principalAmount - liability.outstandingAmount;
        const percentage = (repaid / liability.principalAmount) * 100;
        const isSettled = liability.status === "SETTLED";

        return (
          <Card key={liability.id} className="p-5 space-y-4 shadow-md rounded-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-800">{liability.title}</h3>
                <p className="text-xs text-gray-500">{liability.type}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  isSettled
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {liability.status}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-700">
              <p>Principal: ₦{liability.principalAmount.toLocaleString()}</p>
              <p>Outstanding: ₦{liability.outstandingAmount.toLocaleString()}</p>
            </div>

            {/* Gradient Progress */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {!isSettled && (
              <Button
                className="w-full mt-2"
                onClick={() => setSelected(liability.id)}
              >
                Repay
              </Button>
            )}

            {selected === liability.id && (
              <RepayLiabilityModal
                liabilityId={liability.id}
                onClose={() => setSelected(null)}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
};