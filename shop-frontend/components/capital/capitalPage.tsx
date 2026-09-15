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

import { financeEventType } from "@business/shared-types";
import { AggregateType } from "@/offline/domain/aggregate";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { PageHeader } from "@/components/ui/PageHeader";

import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";

interface CashflowTableProps {
  mode: "OPENING" | "LIVE";
  action: "INJECT" | "WITHDRAW";
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
  action,
  onCompleted,
}: CashflowTableProps) {
  const [loading, setLoading] = useState(false);

  const app = useApplication();

  const [entries] = useState<CashEntry[]>([]);

  const [rawAmount, setRawAmount] = useState("");
  const [formattedAmount, setFormattedAmount] =
    useState("");

  const isInject = action === "INJECT";
  const isWithdraw = action === "WITHDRAW";

  const formatNumber = (
    value: string | number
  ) => {
    if (!value) return "";

    const num =
      typeof value === "string"
        ? Number(value.replace(/,/g, ""))
        : value;

    if (!Number.isFinite(num)) return "";

    return num.toLocaleString("en-NG");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      e.target.value.replace(/,/g, "");

    if (!/^\d*$/.test(value)) return;

    setRawAmount(value);
    setFormattedAmount(formatNumber(value));
  };

  const clearInput = () => {
    setRawAmount("");
    setFormattedAmount("");
  };

  const handleInject = async () => {
    const amount = Number(rawAmount);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      await app.capital.injectCapital({
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
        mode === "OPENING"
          ? "Opening capital recorded"
          : "Capital added successfully"
      );

      if (mode === "OPENING") {
        onCompleted?.();
      }
    } catch (error) {
      console.error(
        "Failed to add capital",
        error
      );

      toast.error(
        "Failed to add capital"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (mode === "OPENING") return;

    const amount = Number(rawAmount);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      await app.capital.withdrawCapital({
        type:
          financeEventType.CAPITAL_DRAWINGS,

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
        "Capital withdrawal recorded"
      );
    } catch (error) {
      console.error(
        "Failed to withdraw capital",
        error
      );

      toast.error(
        "Failed to withdraw capital"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatSource = (
    source?: string | null
  ) => {
    if (!source) return "";

    return source
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const isDisabled =
    loading ||
    !rawAmount ||
    Number(rawAmount) <= 0;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 pb-10">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <PageHeader
        title={
          mode === "OPENING"
            ? "Opening Capital"
            : isInject
              ? "Add Capital"
              : "Withdraw Capital"
        }
        subtitle={
          mode === "OPENING"
            ? "Set the initial capital position for this business."
            : isInject
              ? "Put additional cash into the business."
              : "Move capital out of the business."
        }
      />

      {/* =====================================================
          OPENING MODE NOTICE
          ===================================================== */}

      {mode === "OPENING" && (
        <div
          className="
            rounded-2xl
            border
            border-amber-400/10
            bg-amber-400/[0.06]
            px-4
            py-3.5
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                mt-0.5
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-amber-400/10
                text-amber-300
              "
            >
              <Wallet size={14} />
            </div>

            <div>
              <p className="text-sm font-medium text-amber-200">
                Opening balance
              </p>

              <p className="mt-0.5 text-xs leading-5 text-amber-200/60">
                This amount becomes part of the
                business's initial cash position.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CAPITAL CONTROL
          ===================================================== */}

      <GlassCard
        variant="elevated"
        className="
          overflow-hidden
          rounded-[28px]
          border-white/[0.08]
          p-0
        "
      >
        {/* Direction header */}

        <div className="px-6 pt-6 sm:px-7 sm:pt-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-2xl
                  ${
                    isInject
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-red-400/10 text-red-300"
                  }
                `}
              >
                {isInject ? (
                  <ArrowUp size={18} />
                ) : (
                  <ArrowDown size={18} />
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  {isInject
                    ? "Capital entering"
                    : "Capital leaving"}
                </p>

                <p className="text-xs text-gray-500">
                  {isInject
                    ? "Business funding"
                    : "Capital withdrawal"}
                </p>
              </div>
            </div>

            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-medium
                uppercase
                tracking-wider
                ${
                  isInject
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-red-400/10 text-red-300"
                }
              `}
            >
              {isInject ? "IN" : "OUT"}
            </span>
          </div>
        </div>

        {/* =====================================================
            LARGE CALCULATOR-STYLE AMOUNT
            ===================================================== */}

        <div className="px-5 pb-7 pt-8 sm:px-7 sm:pb-8">
          <label className="mb-3 block px-1 text-xs font-medium uppercase tracking-wider text-gray-500">
            Amount
          </label>

          <div
            className={`
              relative
              overflow-hidden
              rounded-[24px]
              border
              bg-black/20
              shadow-inner
              transition-all
              duration-200
              ${
                isInject
                  ? `
                    border-emerald-400/20
                    shadow-[0_0_0_1px_rgba(16,185,129,0.04),0_20px_60px_rgba(16,185,129,0.06)]
                    focus-within:border-emerald-400/50
                    focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.10),0_20px_70px_rgba(16,185,129,0.10)]
                  `
                  : `
                    border-red-400/20
                    shadow-[0_0_0_1px_rgba(239,68,68,0.04),0_20px_60px_rgba(239,68,68,0.06)]
                    focus-within:border-red-400/50
                    focus-within:shadow-[0_0_0_1px_rgba(239,68,68,0.10),0_20px_70px_rgba(239,68,68,0.10)]
                  `
              }
            `}
          >
            {/* Subtle top highlight */}

            <div
              className={`
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                ${
                  isInject
                    ? "bg-emerald-300/30"
                    : "bg-red-300/30"
                }
              `}
            />

            {/* Currency symbol */}

            <span
              className={`
                absolute
                left-5
                top-1/2
                z-10
                -translate-y-1/2
                text-3xl
                font-medium
                ${
                  isInject
                    ? "text-emerald-300"
                    : "text-red-300"
                }
              `}
            >
              ₦
            </span>

            <GlassInput
              className="
                h-24
                w-full
                border-0
                bg-transparent
                pl-14
                pr-5
                text-right
                text-4xl
                font-bold
                leading-none
                tracking-[-0.04em]
                text-white
                shadow-none
                outline-none
                placeholder:text-gray-700
                focus:ring-0
                sm:h-28
                sm:pl-16
                sm:pr-6
                sm:text-5xl
              "
              value={formattedAmount}
              onChange={handleChange}
              placeholder="0"
              inputMode="numeric"
              disabled={loading}
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1">
            <p className="text-[11px] text-gray-600">
              Enter the exact amount of cash involved.
            </p>

            {rawAmount && (
              <p
                className={`
                  text-[11px] font-medium
                  ${
                    isInject
                      ? "text-emerald-400/70"
                      : "text-red-400/70"
                  }
                `}
              >
                {isInject
                  ? "Cash in"
                  : "Cash out"}
              </p>
            )}
          </div>
        </div>

        {/* =====================================================
            ACTION AREA
            ===================================================== */}

        <div
          className="
            border-t
            border-white/[0.06]
            bg-white/[0.015]
            px-6
            py-5
            sm:px-7
          "
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            {isInject ? (
              <GlassButton
                disabled={isDisabled}
                onClick={handleInject}
                icon={
                  <ArrowUp size={17} />
                }
                className="
                  h-13
                  flex-1
                  rounded-2xl
                  bg-emerald-500
                  font-semibold
                  text-white
                  shadow-[0_8px_30px_rgba(16,185,129,0.18)]
                  transition
                  hover:bg-emerald-400
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {loading
                  ? "Recording..."
                  : mode === "OPENING"
                    ? "Set Opening Capital"
                    : "Add Capital"}
              </GlassButton>
            ) : (
              <GlassButton
                variant="danger"
                disabled={
                  mode === "OPENING" ||
                  isDisabled
                }
                onClick={handleWithdraw}
                icon={
                  <ArrowDown size={17} />
                }
                className="
                  h-13
                  flex-1
                  rounded-2xl
                  font-semibold
                  shadow-[0_8px_30px_rgba(239,68,68,0.12)]
                  transition
                  active:scale-[0.98]
                "
              >
                {loading
                  ? "Recording..."
                  : "Withdraw Capital"}
              </GlassButton>
            )}

            <GlassButton
              variant="secondary"
              disabled={loading}
              onClick={() =>
                toast.info("Refreshing...")
              }
              icon={
                <RefreshCw size={16} />
              }
              className="
                h-13
                rounded-2xl
                px-5
                transition
                active:scale-[0.98]
              "
            >
              Refresh
            </GlassButton>
          </div>

          {isWithdraw &&
            mode !== "OPENING" && (
              <p className="mt-3 text-center text-[11px] text-gray-600">
                This records a capital movement,
                not a business operating expense.
              </p>
            )}
        </div>
      </GlassCard>

      {/* =====================================================
          RECENT ACTIVITY
          ===================================================== */}

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-gray-300">
            Recent activity
          </h3>

          <span className="text-[11px] text-gray-600">
            Latest 10
          </span>
        </div>

        {entries.length === 0 ? (
          <GlassCard
            className="
              rounded-[24px]
              border-white/[0.06]
              p-10
            "
          >
            <div className="text-center">
              <GlassIcon
                size="lg"
                variant="primary"
              >
                <Wallet size={21} />
              </GlassIcon>

              <p className="mt-4 text-sm text-gray-400">
                No capital activity yet
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Capital movements will appear here.
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
                className="
                  rounded-2xl
                  border-white/[0.06]
                  p-4
                  transition
                  hover:bg-white/[0.025]
                "
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
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
                          size={15}
                        />
                      ) : (
                        <ArrowDown
                          size={15}
                        />
                      )}
                    </GlassIcon>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-200">
                        {entry.type}
                      </p>

                      {entry.source && (
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {formatSource(
                            entry.source
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-200">
                      ₦
                      {formatNumber(
                        entry.amount
                      )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-600">
                      {new Date(
                        entry.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))
        )}
      </section>
    </div>
  );
}
