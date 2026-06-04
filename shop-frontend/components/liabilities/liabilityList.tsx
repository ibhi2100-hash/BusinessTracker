"use client";

import { useState } from "react";
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassIcon } from "@/components/ui/GlassIcon";

import { RepayLiabilityModal } from "./RepayLiabilityModal";

interface Liability {
  id: string;
  title: string;
  type: string;
  status: string;
  principalAmount: number;
  outstandingAmount: number;
}

export function LiabilityList() {
  const [loading] = useState(false);

  const [data] =
    useState<Liability[]>([]);

  const [selected, setSelected] =
    useState<string | null>(null);

  if (loading) {
    return (
      <GlassCard className="p-6">
        Loading liabilities...
      </GlassCard>
    );
  }

  if (!data.length) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <GlassIcon>
            <Landmark size={22} />
          </GlassIcon>

          <div>
            <p className="font-medium">
              No liabilities yet
            </p>

            <p className="text-sm text-gray-400">
              Loans and obligations will
              appear here.
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((liability) => {
        const repaid =
          liability.principalAmount -
          liability.outstandingAmount;

        const percentage =
          liability.principalAmount > 0
            ? (repaid /
                liability.principalAmount) *
              100
            : 0;

        const isSettled =
          liability.status ===
          "SETTLED";

        return (
          <GlassCard
            key={liability.id}
            className="p-5"
          >
            <div className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">
                    {liability.title}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {liability.type}
                  </p>
                </div>

                <GlassIcon
                  variant={
                    isSettled
                      ? "success"
                      : "danger"
                  }
                >
                  {isSettled ? (
                    <CheckCircle2 />
                  ) : (
                    <AlertTriangle />
                  )}
                </GlassIcon>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">
                    Principal
                  </p>

                  <p>
                    ₦
                    {liability.principalAmount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400">
                    Outstanding
                  </p>

                  <p>
                    ₦
                    {liability.outstandingAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all"
                    style={{
                      width: `${Math.min(
                        percentage,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-gray-400">
                  {percentage.toFixed(0)}%
                  repaid
                </p>
              </div>

              {!isSettled && (
                <GlassButton
                  className="w-full"
                  onClick={() =>
                    setSelected(
                      liability.id
                    )
                  }
                >
                  Repay Liability
                </GlassButton>
              )}

              {selected ===
                liability.id && (
                <RepayLiabilityModal
                  liabilityId={
                    liability.id
                  }
                  onClose={() =>
                    setSelected(
                      null
                    )
                  }
                />
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}