"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, Receipt, RefreshCw } from "lucide-react";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import type { Expense } from "@business/shared-types";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { PageHeader } from "@/components/ui/PageHeader";

import { useApplication } from "@/src/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "@/src/context/BusinessContext";

interface ExpenseTunnelProps {
  mode: "OPENING" | "LIVE";
}

type ExpenseCategory =
  | "RENT"
  | "ELECTRICITY"
  | "WATER"
  | "INTERNET"
  | "TRANSPORT"
  | "SALARY"
  | "WAGES"
  | "REPAIRS"
  | "MAINTENANCE"
  | "PACKAGING"
  | "MARKETING"
  | "TAX"
  | "BANK_CHARGES"
  | "OFFICE"
  | "SECURITY"
  | "OTHER";

type UiPaymentMethod = "CASH" | "BANK" | "TRANSFER" | "POS" | "OTHER";

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "RENT", label: "Rent" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "WATER", label: "Water" },
  { value: "INTERNET", label: "Internet" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "SALARY", label: "Salary" },
  { value: "WAGES", label: "Wages" },
  { value: "REPAIRS", label: "Repairs" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "MARKETING", label: "Marketing" },
  { value: "TAX", label: "Tax" },
  { value: "BANK_CHARGES", label: "Bank charges" },
  { value: "OFFICE", label: "Office" },
  { value: "SECURITY", label: "Security" },
  { value: "OTHER", label: "Other" },
];

const PAYMENT_METHODS: { value: UiPaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "POS", label: "POS" },
  { value: "OTHER", label: "Other" },
];

/** UI payment → ExpenseApi paymentMethod */
const PAYMENT_MAP: Record<
  UiPaymentMethod,
  "cash" | "transfer" | "card" | "other"
> = {
  CASH: "cash",
  BANK: "transfer",
  TRANSFER: "transfer",
  POS: "card",
  OTHER: "other",
};

export default function ExpenseTunnel({
  mode,
}: ExpenseTunnelProps) {
  const app = useApplication();

  const {
      businessId,
      branchId,
    } = useBusinessContext();

  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Expense[]>([]);

  const [rawAmount, setRawAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("OTHER");
  const [description, setDescription] = useState("");
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<UiPaymentMethod>("CASH");
  const [reference, setReference] = useState("");

  const formatNumber = (value: string | number) => {
    if (value === "" || value === null || value === undefined) return "";
    const num =
      typeof value === "string"
        ? Number(value.replace(/,/g, ""))
        : value;
    if (!Number.isFinite(num)) return "";
    return num.toLocaleString("en-NG");
  };

  const loadRecent = useCallback(async () => {
    if (!businessId) return;
    try {
      const list = await app.expense.listExpenses({
        businessId,
        branchId,
        status: "all",
        limit: 10,
        offset: 0,
      });
      setEntries(list);
    } catch (err) {
      console.error("Failed to load expenses", err);
    }
  }, [app, businessId, branchId]);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (!/^\d*$/.test(value)) return;
    setRawAmount(value);
    setFormattedAmount(formatNumber(value));
  };

  const clearForm = () => {
    setRawAmount("");
    setFormattedAmount("");
    setCategory("OTHER");
    setDescription("");
    setVendor("");
    setPaymentMethod("CASH");
    setReference("");
  };

  const handleExpense = async () => {
    const amount = Number(rawAmount);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid expense amount");
      return;
    }
    if (!description.trim()) {
      toast.error("Describe what the expense was for");
      return;
    }
    if (!businessId) {
      toast.error("Business context is missing");
      return;
    }

    try {
      setLoading(true);

      const categoryLabel =
        EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ??
        category;

      await app.expense.createExpense({
        mode,
        aggregateId: nanoid(),
        payload: {
          title: description.trim(),
          description: description.trim(),
          amount,
          categoryId: category,
          categoryName: categoryLabel,
          vendorRef: vendor.trim() || undefined,
          receiptRef: reference.trim() || undefined,
          paymentMethod: PAYMENT_MAP[paymentMethod],
          businessId,
          branchId,
        },
      });

      clearForm();
      await loadRecent();
      toast.success("Expense recorded successfully");
    } catch (error) {
      console.error("Failed to record expense", error);
      toast.error("Failed to record expense");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !rawAmount ||
    Number(rawAmount) <= 0 ||
    !description.trim();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 pb-10">
      <PageHeader
        title="Record Expense"
        subtitle="Record money spent operating the business"
      />

      {mode === "OPENING" && (
        <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.06] px-4 py-3.5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-amber-300">
              <Receipt size={14} />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-200">
                Opening Mode
              </p>
              <p className="mt-0.5 text-xs leading-5 text-amber-200/60">
                Expenses recorded here become part of the opening
                business position.
              </p>
            </div>
          </div>
        </div>
      )}

      <GlassCard
        variant="elevated"
        className="overflow-hidden rounded-[28px] border-white/[0.08] p-0"
      >
        <div className="px-6 pt-6 sm:px-7 sm:pt-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
                <ArrowDown size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  Business expense
                </p>
                <p className="text-xs text-gray-500">
                  Cash leaving the business
                </p>
              </div>
            </div>
            <span className="rounded-full bg-red-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-red-300">
              EXPENSE
            </span>
          </div>
        </div>

        <div className="px-5 pb-7 pt-8 sm:px-7 sm:pb-8">
          <label className="mb-3 block px-1 text-xs font-medium uppercase tracking-wider text-gray-500">
            Amount
          </label>
          <div className="relative overflow-hidden rounded-[24px] border border-red-400/20 bg-black/20 shadow-inner transition-all duration-200 focus-within:border-red-400/50">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-red-300/30" />
            <span className="absolute left-5 top-1/2 z-10 -translate-y-1/2 text-3xl font-medium text-red-300">
              ₦
            </span>
            <GlassInput
              className="h-24 w-full border-0 bg-transparent pl-14 pr-5 text-right text-4xl font-bold leading-none tracking-[-0.04em] text-white shadow-none outline-none placeholder:text-gray-700 focus:ring-0 sm:h-28 sm:pl-16 sm:pr-6 sm:text-5xl"
              value={formattedAmount}
              onChange={handleAmountChange}
              placeholder="0"
              inputMode="numeric"
              disabled={loading}
            />
          </div>
          <div className="mt-3 flex items-center justify-between px-1">
            <p className="text-[11px] text-gray-600">
              Enter the exact amount spent.
            </p>
            {rawAmount && (
              <p className="text-[11px] font-medium text-red-400/70">
                Cash out
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5 border-t border-white/[0.06] bg-white/[0.012] px-6 py-6 sm:px-7">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Expense category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ExpenseCategory)
              }
              disabled={loading}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-white/20 disabled:opacity-50"
            >
              {EXPENSE_CATEGORIES.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                  className="bg-gray-900"
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">
              What was the expense for?
            </label>
            <GlassInput
              className="h-12 rounded-2xl"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Shop electricity bill"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Vendor / recipient
              <span className="ml-1 text-gray-600">optional</span>
            </label>
            <GlassInput
              className="h-12 rounded-2xl"
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              placeholder="e.g. Electricity provider"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Payment method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as UiPaymentMethod)
              }
              disabled={loading}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-white/20 disabled:opacity-50"
            >
              {PAYMENT_METHODS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                  className="bg-gray-900"
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-gray-400">
              Reference
              <span className="ml-1 text-gray-600">optional</span>
            </label>
            <GlassInput
              className="h-12 rounded-2xl"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Receipt / transfer reference"
              disabled={loading}
            />
          </div>
        </div>

        <div className="border-t border-white/[0.06] bg-white/[0.015] px-6 py-5 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row">
            <GlassButton
              disabled={isDisabled}
              onClick={handleExpense}
              icon={<ArrowDown size={17} />}
              variant="danger"
              className="h-13 flex-1 rounded-2xl font-semibold shadow-[0_8px_30px_rgba(239,68,68,0.12)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Recording..." : "Record Expense"}
            </GlassButton>

            <GlassButton
              variant="secondary"
              disabled={loading}
              onClick={() => void loadRecent()}
              icon={<RefreshCw size={16} />}
              className="h-13 rounded-2xl px-5 transition active:scale-[0.98]"
            >
              Refresh
            </GlassButton>
          </div>
          <p className="mt-3 text-center text-[11px] text-gray-600">
            This records an operating expense and reduces the
            business&apos;s available cash.
          </p>
        </div>
      </GlassCard>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-gray-300">
            Recent expenses
          </h3>
          <span className="text-[11px] text-gray-600">Latest 10</span>
        </div>

        {entries.length === 0 ? (
          <GlassCard className="rounded-[24px] border-white/[0.06] p-10">
            <div className="text-center">
              <GlassIcon size="lg" variant="primary">
                <Receipt size={21} />
              </GlassIcon>
              <p className="mt-4 text-sm text-gray-400">
                No expenses recorded yet
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Recorded business expenses will appear here.
              </p>
            </div>
          </GlassCard>
        ) : (
          entries.map((entry) => (
            <GlassCard
              key={entry.id}
              className="rounded-2xl border-white/[0.06] p-4 transition hover:bg-white/[0.025]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <GlassIcon size="sm" variant="danger">
                    <ArrowDown size={15} />
                  </GlassIcon>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-200">
                      {entry.categoryName ?? entry.categoryId ?? "Expense"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {entry.title}
                    </p>
                    {entry.vendorRef && (
                      <p className="mt-0.5 truncate text-[11px] text-gray-600">
                        {entry.vendorRef}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-gray-200">
                    ₦{formatNumber(entry.amount)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-600">
                    {new Date(entry.incurredAt).toLocaleDateString()}
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