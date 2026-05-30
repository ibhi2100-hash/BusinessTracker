"use client";

import React, { useState } from "react";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranchStore } from "@/src/store/useBranchStore";
import { toast } from "sonner";
import { eventService } from "@/src/services/eventService";
import { financeEventType } from "@/offline/core/events/eventGroups/financeEvent";
import { nanoid } from "nanoid";
import { AggregateType } from "@/offline/domain/aggregate";

interface CashflowTableProps {
  mode: "OPENING" | "LIVE";
  onCompleted?: () => void;
}

type CashEntry = {
  id: string;
  type: string;
  amount: number;
  source?: string | null;
  balanceAfter: number;
  direction: "IN" | "OUT";
  isOpening?: boolean;
  createdAt: string;
};

export default function CashflowTable({
  mode,
  onCompleted,
}: CashflowTableProps) {
  const [loading, setLoading] = useState(false);
  const [entries] = useState<CashEntry[]>([]);

  const activeBranchId = useBranchStore((s) => s.activeBranchId);

  const [rawAmount, setRawAmount] = useState<string>("");
  const [formattedAmount, setFormattedAmount] = useState<string>("");

  const formatNumber = (value: string | number) => {
    if (!value) return "";
    const num =
      typeof value === "string"
        ? Number(value.replace(/,/g, ""))
        : value;

    return num.toLocaleString("en-NG");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");

    if (/^\d*$/.test(value)) {
      setRawAmount(value);
      setFormattedAmount(formatNumber(value));
    }
  };

  const handleInject = async () => {
    const amount = Number(rawAmount);
    if (!amount || amount <= 0) return;

    setLoading(true);

    try {
      const aggregateId = nanoid();

      await eventService.create({
        type:
          mode === "OPENING"
            ? financeEventType.OPENING_CAPITAL
            : financeEventType.CASH_ADDED,
        aggregateType: AggregateType.CAPITAL_ACCOUNT,
        aggregateId,
        payload: { amount },
        mode,
      });

      setRawAmount("");
      setFormattedAmount("");

      toast.success("Cash added successfully");

      if (mode === "OPENING") {
        onCompleted?.();
      }
    } catch {
      toast.error("Failed to add cash");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (mode === "OPENING") return;

    const amount = Number(rawAmount);
    if (!amount || amount <= 0) return;

    setRawAmount("");
    setFormattedAmount("");

    toast.success("Withdraw action triggered");
  };

  const formatSource = (source?: string | null) => {
    if (!source) return "";
    return source
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const isDisabled = !rawAmount || Number(rawAmount) <= 0;

  return (
    <div className="min-h-screen bg-[#050816] text-white px-4 py-6 space-y-6">
      {/* MODE BANNER */}
      {mode === "OPENING" && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          Opening Mode: Cash is recorded as initial capital.
        </div>
      )}

      {/* INPUT CARD */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-green-400">₦</span>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter amount"
            className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
            value={formattedAmount}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleInject}
            disabled={isDisabled || loading}
            className="flex items-center justify-center gap-2"
          >
            <ArrowUp className="w-4 h-4" />
            Inject
          </Button>

          <Button
            onClick={handleWithdraw}
            disabled={mode === "OPENING" || isDisabled}
            variant="destructive"
            className="flex items-center justify-center gap-2"
          >
            <ArrowDown className="w-4 h-4" />
            Withdraw
          </Button>

          <Button
            onClick={() => toast.info("Refreshing...")}
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* MOBILE LIST (PRIMARY UX) */}
      <div className="space-y-3 lg:hidden">
        <h3 className="text-sm text-gray-400">Recent Activity</h3>

        {entries.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No activity yet
          </div>
        ) : (
          entries.slice(-5).reverse().map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {c.direction === "IN" ? (
                    <ArrowUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-400" />
                  )}
                  <span>{c.type}</span>
                </div>

                <span className="text-sm font-semibold">
                  ₦{formatNumber(c.amount)}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>{formatSource(c.source)}</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-2 text-xs">
                {c.isOpening ? (
                  <span className="text-indigo-300">Opening</span>
                ) : (
                  <span className="text-green-300">Running</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <h3 className="text-lg font-semibold mb-4">
          Recent Cashflow Activity
        </h3>

        {entries.length === 0 ? (
          <p className="text-gray-500">No activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400 border-b border-white/10">
                <tr>
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-left">Amount</th>
                  <th className="py-2 text-left">Source</th>
                  <th className="py-2 text-left">Balance</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {entries.slice(-5).reverse().map((c) => (
                  <tr key={c.id} className="border-b border-white/5">
                    <td className="py-2 flex items-center gap-2">
                      {c.direction === "IN" ? (
                        <ArrowUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-400" />
                      )}
                      {c.type}
                    </td>

                    <td>₦{formatNumber(c.amount)}</td>
                    <td>{formatSource(c.source)}</td>
                    <td>₦{formatNumber(c.balanceAfter)}</td>

                    <td>
                      {c.isOpening ? (
                        <span className="text-indigo-300">Opening</span>
                      ) : (
                        <span className="text-green-300">Running</span>
                      )}
                    </td>

                    <td className="text-gray-400 text-xs">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}