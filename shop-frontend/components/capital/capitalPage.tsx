"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { nanoid } from "nanoid";
import { toast } from "sonner";

import { eventService } from "@/src/services/eventService";

import { financeEventType } from "@business/shared-types";
import { AggregateType } from "@/offline/domain/aggregate";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { PageHeader } from "@/components/ui/PageHeader";

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

  const [rawAmount, setRawAmount] =
    useState("");

  const [formattedAmount, setFormattedAmount] =
    useState("");

  const formatNumber = (
    value: string | number
  ) => {
    if (!value) return "";

    const num =
      typeof value === "string"
        ? Number(value.replace(/,/g, ""))
        : value;

    return num.toLocaleString("en-NG");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      e.target.value.replace(/,/g, "");

    if (/^\d*$/.test(value)) {
      setRawAmount(value);
      setFormattedAmount(
        formatNumber(value)
      );
    }
  };

  const clearInput = () => {
    setRawAmount("");
    setFormattedAmount("");
  };

  const handleInject = async () => {
    const amount = Number(rawAmount);

    if (!amount || amount <= 0)
      return;

    try {
      setLoading(true);

      await eventService.create({
        type:
          mode === "OPENING"
            ? financeEventType.OPENING_CAPITAL
            : financeEventType.CASH_ADDED,

        aggregateType:
          AggregateType.CAPITAL_ACCOUNT,

        aggregateId: nanoid(),

        payload: {
          amount,
        },

        mode,
      });

      clearInput();

      toast.success(
        "Cash added successfully"
      );

      if (mode === "OPENING") {
        onCompleted?.();
      }
    } catch {
      toast.error(
        "Failed to add cash"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (mode === "OPENING") return;

    const amount = Number(rawAmount);

    if (!amount || amount <= 0)
      return;

    clearInput();

    toast.success(
      "Withdraw action triggered"
    );
  };

  const formatSource = (
    source?: string | null
  ) => {
    if (!source) return "";

    return source
      .split("_")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
      )
      .join(" ");
  };

  const isDisabled =
    !rawAmount ||
    Number(rawAmount) <= 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          mode === "OPENING"
            ? "Opening Capital"
            : "Cashflow"
        }
        subtitle="Manage cash entering and leaving the business"
      />

      {mode === "OPENING" && (
        <GlassCard
          className="
          p-4
          border-yellow-500/20
          bg-yellow-500/10
        "
        >
          <p className="text-sm text-yellow-300">
            Opening Mode:
            Capital recorded here
            becomes your initial
            business cash balance.
          </p>
        </GlassCard>
      )}

      <GlassCard
        variant="elevated"
        className="p-5 space-y-4"
      >
        <div className="relative">
          <span
            className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-emerald-400
            font-semibold
            z-10
          "
          >
            ₦
          </span>

          <GlassInput
            className="pl-10"
            value={formattedAmount}
            onChange={handleChange}
            placeholder="Enter amount"
            inputMode="numeric"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <GlassButton
            disabled={
              isDisabled || loading
            }
            onClick={handleInject}
            icon={
              <ArrowUp size={16} />
            }
          >
            Inject
          </GlassButton>

          <GlassButton
            variant="danger"
            disabled={
              mode === "OPENING" ||
              isDisabled
            }
            onClick={
              handleWithdraw
            }
            icon={
              <ArrowDown size={16} />
            }
          >
            Withdraw
          </GlassButton>

          <GlassButton
            variant="secondary"
            onClick={() =>
              toast.info(
                "Refreshing..."
              )
            }
            icon={
              <RefreshCw size={16} />
            }
          >
            Refresh
          </GlassButton>
        </div>
      </GlassCard>

      <div className="space-y-3">
        <h3 className="text-sm text-gray-400">
          Recent Activity
        </h3>

        {entries.length === 0 ? (
          <GlassCard className="p-10">
            <div className="text-center">
              <GlassIcon
                size="lg"
                variant="primary"
              >
                <Wallet size={22} />
              </GlassIcon>

              <p className="mt-4 text-gray-400">
                No cashflow activity
                yet
              </p>
            </div>
          </GlassCard>
        ) : (
          entries
            .slice(-10)
            .reverse()
            .map((entry) => (
              <GlassCard
                key={entry.id}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <GlassIcon
                      size="sm"
                      variant={
                        entry.direction ===
                        "IN"
                          ? "success"
                          : "danger"
                      }
                    >
                      {entry.direction ===
                      "IN" ? (
                        <ArrowUp
                          size={16}
                        />
                      ) : (
                        <ArrowDown
                          size={16}
                        />
                      )}
                    </GlassIcon>

                    <div>
                      <p className="font-medium">
                        {entry.type}
                      </p>

                      <p className="text-xs text-gray-400">
                        {formatSource(
                          entry.source
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ₦
                      {formatNumber(
                        entry.amount
                      )}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(
                        entry.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))
        )}
      </div>
    </div>
  );
}