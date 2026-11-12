
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  Receipt,
  Search,
  Users,
  Wallet,
} from "lucide-react";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { downloadExpensesAnalysisPdf } from "./expenseAnalysisPdf";

type ExpenseRow = {
  id: string;
  businessId: string;
  branchId: string;
  amount: number;
  title?: string | null;
  description?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  vendorId?: string | null;
  vendorRef?: string | null;
  vendorName?: string | null;
  paymentMethod?: string | null;
  userId?: string | null;
  userName?: string | null;
  status?: string | null;
  incurredAt?: string | number | null;
  createdAt?: string | number | null;
};

type Props = {
  businessId: string;
  branchId: string;
  branchName?: string;
  currency?: string;
  staffNames?: Record<string, string>;
};

type Tab =
  | "overview"
  | "categories"
  | "staff"
  | "transactions"
  | "insights";

type DateRange = "today" | "week" | "month" | "year" | "all";

const PAGE_SIZE = 500;

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);

function getExpenseDate(expense: ExpenseRow): Date | null {
  const value = expense.incurredAt ?? expense.createdAt;
  if (!value) return null;

  const date =
    typeof value === "number"
      ? new Date(value < 1e12 ? value * 1000 : value)
      : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getCategory(expense: ExpenseRow) {
  return expense.categoryName?.trim() || "Uncategorised";
}

function getRecorder(
  expense: ExpenseRow,
  staffNames: Record<string, string>
) {
  if (expense.userId && staffNames[expense.userId]) {
    return staffNames[expense.userId];
  }

  return (
    expense.userName ||
    expense.userId ||
    "Unknown recorder"
  );
}

function isVoided(expense: ExpenseRow) {
  return expense.status?.toLowerCase() === "voided";
}

function isReimbursed(expense: ExpenseRow) {
  return expense.status?.toLowerCase() === "reimbursed";
}

function dateStart(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function isInRange(date: Date, range: DateRange) {
  const now = new Date();
  const today = dateStart(now);

  if (range === "all") return true;
  if (range === "today") return date >= today;

  if (range === "week") {
    const start = new Date(today);
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    return date >= start;
  }

  if (range === "month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  return date.getFullYear() === now.getFullYear();
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon size={18} className="text-gray-400" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-gray-400">
      {message}
    </div>
  );
}

export default function ExpensesAnalysisPage({
  businessId,
  branchId,
  branchName = "Current branch",
  currency = "NGN",
  staffNames = {},
}: Props) {
  const app = useApplication();

  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [range, setRange] = useState<DateRange>("month");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [exporting, setExporting] = useState(false);

  const loadExpenses = useCallback(async () => {
    if (!businessId || !branchId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const all: ExpenseRow[] = [];
      let offset = 0;

      while (true) {
        const result = await app.expense.listExpenses({
          businessId,
          branchId,
          status: "all",
          limit: PAGE_SIZE,
          offset,
        });

        const page = result as unknown as ExpenseRow[];
        all.push(...page);

        if (page.length < PAGE_SIZE) break;
        offset += PAGE_SIZE;
      }

      // Defensive branch boundary: never show another branch's records.
      const branchExpenses = all.filter(
        (expense) =>
          expense.businessId === businessId &&
          expense.branchId === branchId
      );

      setExpenses(branchExpenses);

      console.log("[ExpensesAnalysis] Loaded branch expenses", {
        businessId,
        branchId,
        count: branchExpenses.length,
      });
    } catch (err) {
      console.error("[ExpensesAnalysis] Failed to load", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load expenses."
      );
    } finally {
      setLoading(false);
    }
  }, [app, businessId, branchId]);

  useEffect(() => {
    void loadExpenses();
  }, [loadExpenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (isVoided(expense)) return false;

      const date = getExpenseDate(expense);
      if (date && !isInRange(date, range)) return false;

      if (
        categoryFilter !== "all" &&
        getCategory(expense) !== categoryFilter
      ) {
        return false;
      }

      const query = search.trim().toLowerCase();
      if (!query) return true;

      const searchable = [
        expense.title,
        expense.description,
        expense.vendorName,
        expense.vendorRef,
        expense.paymentMethod,
        expense.categoryName,
        getRecorder(expense, staffNames),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [expenses, range, categoryFilter, search, staffNames]);

  const metrics = useMemo(() => {
    const total = filteredExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    const reimbursed = filteredExpenses
      .filter(isReimbursed)
      .reduce(
        (sum, expense) => sum + Number(expense.amount || 0),
        0
      );

    const largest = filteredExpenses.reduce<ExpenseRow | null>(
      (current, expense) =>
        !current || Number(expense.amount) > Number(current.amount)
          ? expense
          : current,
      null
    );

    return {
      total,
      count: filteredExpenses.length,
      average:
        filteredExpenses.length > 0
          ? total / filteredExpenses.length
          : 0,
      largest,
      reimbursed,
    };
  }, [filteredExpenses]);

  const categories = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const expense of filteredExpenses) {
      const category = getCategory(expense);
      grouped.set(
        category,
        (grouped.get(category) ?? 0) + Number(expense.amount || 0)
      );
    }

    return [...grouped.entries()]
      .map(([name, amount]) => ({
        name,
        amount,
        percentage:
          metrics.total > 0 ? (amount / metrics.total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, metrics.total]);

  const staffSpending = useMemo(() => {
    const grouped = new Map<
      string,
      { amount: number; count: number }
    >();

    for (const expense of filteredExpenses) {
      const name = getRecorder(expense, staffNames);
      const current = grouped.get(name) ?? {
        amount: 0,
        count: 0,
      };

      current.amount += Number(expense.amount || 0);
      current.count += 1;
      grouped.set(name, current);
    }

    return [...grouped.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, staffNames]);

  const paymentMethods = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const expense of filteredExpenses) {
      const method = expense.paymentMethod || "Unspecified";
      grouped.set(
        method,
        (grouped.get(method) ?? 0) + Number(expense.amount || 0)
      );
    }

    return [...grouped.entries()].sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  const dailyTrend = useMemo(() => {
    const grouped = new Map<string, number>();

    for (const expense of filteredExpenses) {
      const date = getExpenseDate(expense);
      if (!date) continue;

      const key = date.toISOString().slice(0, 10);
      grouped.set(
        key,
        (grouped.get(key) ?? 0) + Number(expense.amount || 0)
      );
    }

    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14);
  }, [filteredExpenses]);

  const insights = useMemo(() => {
    const values = filteredExpenses.map((item) =>
      Number(item.amount || 0)
    );
    const average =
      values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;

    const largeThreshold = average * 2;
    const large = filteredExpenses.filter(
      (item) => Number(item.amount || 0) > largeThreshold
    );

    const missingDescription = filteredExpenses.filter(
      (item) =>
        !item.description?.trim() && !item.title?.trim()
    );

    const missingVendor = filteredExpenses.filter(
      (item) =>
        !item.vendorName?.trim() &&
        !item.vendorRef?.trim() &&
        !item.vendorId?.trim()
    );

    const repeated = new Map<string, number>();
    for (const item of filteredExpenses) {
      const key = [
        getCategory(item),
        (item.vendorName || item.vendorRef || "").toLowerCase(),
        Number(item.amount || 0).toFixed(2),
      ].join("|");

      repeated.set(key, (repeated.get(key) ?? 0) + 1);
    }

    const repeatedCount = [...repeated.values()].filter(
      (count) => count > 1
    ).length;

    return {
      large,
      missingDescription,
      missingVendor,
      repeatedCount,
      largeThreshold,
    };
  }, [filteredExpenses]);

  const categoryOptions = useMemo(
    () => [...new Set(expenses.filter((e) => !isVoided(e)).map(getCategory))].sort(),
    [expenses]
  );

  const handleExport = async () => {
    setExporting(true);

    try {
      await downloadExpensesAnalysisPdf({
        branchName,
        currency,
        period: range,
        generatedAt: new Date(),
        expenses: filteredExpenses,
        metrics: {
          total: metrics.total,
          count: metrics.count,
          average: metrics.average,
          reimbursed: metrics.reimbursed,
        },
        categories,
        staffSpending,
        paymentMethods,
        insights: {
          largeExpenses: insights.large.length,
          missingDescription: insights.missingDescription.length,
          missingVendor: insights.missingVendor.length,
          repeatedGroups: insights.repeatedCount,
        },
      });
    } catch (err) {
      console.error("[ExpensesAnalysis] PDF export failed", err);
      window.alert("Could not generate the expenses PDF.");
    } finally {
      setExporting(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "categories", label: "Categories", icon: Wallet },
    { id: "staff", label: "Staff spending", icon: Users },
    { id: "transactions", label: "Transactions", icon: Receipt },
    { id: "insights", label: "Insights", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 text-white">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-gray-400">{branchName}</p>
          <h1 className="text-2xl font-semibold">Expenses Analysis</h1>
          <p className="mt-1 text-sm text-gray-400">
            Understand where this branch's money is going.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as DateRange)}
            className="rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
            <option value="all">All time</option>
          </select>

          <button
            onClick={() => void loadExpenses()}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
          >
            Refresh
          </button>

          <button
            onClick={handleExport}
            disabled={exporting || filteredExpenses.length === 0}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
          >
            <Download size={16} />
            {exporting ? "Preparing..." : "Export PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-gray-400">
          Loading branch expenses...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total expenses"
              value={money(metrics.total, currency)}
              subtitle="Non-voided expenses in selected period"
              icon={Wallet}
            />
            <StatCard
              label="Transactions"
              value={metrics.count.toLocaleString()}
              subtitle="Recorded expense entries"
              icon={Receipt}
            />
            <StatCard
              label="Average expense"
              value={money(metrics.average, currency)}
              subtitle="Average amount per transaction"
              icon={BarChart3}
            />
            <StatCard
              label="Largest expense"
              value={money(
                Number(metrics.largest?.amount || 0),
                currency
              )}
              subtitle={
                metrics.largest?.title ||
                metrics.largest?.description ||
                "No expenses"
              }
              icon={ArrowUpRight}
            />
          </div>

          <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  tab === id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid gap-4 xl:grid-cols-2">
              <section className="rounded-xl border border-white/10 p-4">
                <h2 className="font-semibold">Spending by category</h2>
                <p className="mb-5 mt-1 text-xs text-gray-400">
                  Which operational areas consume the most money?
                </p>

                {categories.length === 0 ? (
                  <EmptyState message="No expenses for this period." />
                ) : (
                  <div className="space-y-4">
                    {categories.slice(0, 8).map((item) => (
                      <div key={item.name}>
                        <div className="mb-1 flex justify-between gap-3 text-sm">
                          <span>{item.name}</span>
                          <span className="text-gray-300">
                            {money(item.amount, currency)} ·{" "}
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${Math.min(item.percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-white/10 p-4">
                <h2 className="font-semibold">Spending trend</h2>
                <p className="mb-5 mt-1 text-xs text-gray-400">
                  Daily totals for the latest 14 dates with expenses.
                </p>

                {dailyTrend.length === 0 ? (
                  <EmptyState message="No dated expenses available." />
                ) : (
                  <div className="flex h-48 items-end gap-2">
                    {dailyTrend.map(([date, amount]) => {
                      const max = Math.max(
                        ...dailyTrend.map(([, value]) => value),
                        1
                      );
                      const height = Math.max((amount / max) * 100, 3);

                      return (
                        <div
                          key={date}
                          className="flex h-full min-w-0 flex-1 flex-col justify-end"
                          title={`${date}: ${money(amount, currency)}`}
                        >
                          <div
                            className="w-full rounded-t bg-blue-500"
                            style={{ height: `${height}%` }}
                          />
                          <span className="mt-2 truncate text-center text-[10px] text-gray-500">
                            {date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-white/10 p-4">
                <h2 className="font-semibold">Payment methods</h2>
                <div className="mt-4 space-y-3">
                  {paymentMethods.length === 0 ? (
                    <EmptyState message="No payment data." />
                  ) : (
                    paymentMethods.map(([method, amount]) => (
                      <div
                        key={method}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-300">{method}</span>
                        <strong>{money(amount, currency)}</strong>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-xl border border-white/10 p-4">
                <h2 className="font-semibold">Spending observations</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <p className="flex justify-between gap-3">
                    <span className="text-gray-400">Reimbursed expenses</span>
                    <strong>{money(metrics.reimbursed, currency)}</strong>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-gray-400">Largest category</span>
                    <strong>{categories[0]?.name ?? "—"}</strong>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-gray-400">Staff who recorded expenses</span>
                    <strong>{staffSpending.length}</strong>
                  </p>
                </div>
              </section>
            </div>
          )}

          {tab === "categories" && (
            <section className="rounded-xl border border-white/10 p-4">
              <h2 className="font-semibold">Category breakdown</h2>
              <p className="mb-4 mt-1 text-sm text-gray-400">
                Total amount and share of branch expenses.
              </p>

              {categories.length === 0 ? (
                <EmptyState message="No category data available." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="py-3">Category</th>
                        <th className="py-3 text-right">Amount</th>
                        <th className="py-3 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((item) => (
                        <tr key={item.name} className="border-t border-white/10">
                          <td className="py-3">{item.name}</td>
                          <td className="py-3 text-right">
                            {money(item.amount, currency)}
                          </td>
                          <td className="py-3 text-right">
                            {item.percentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {tab === "staff" && (
            <section className="rounded-xl border border-white/10 p-4">
              <h2 className="font-semibold">Expenses recorded by staff</h2>
              <p className="mb-4 mt-1 text-sm text-gray-400">
                This identifies who recorded each expense, not necessarily
                who approved or authorized it.
              </p>

              {staffSpending.length === 0 ? (
                <EmptyState message="No staff expense records." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="py-3">Recorded by</th>
                        <th className="py-3 text-right">Transactions</th>
                        <th className="py-3 text-right">Total recorded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffSpending.map((staff) => (
                        <tr key={staff.name} className="border-t border-white/10">
                          <td className="py-3">{staff.name}</td>
                          <td className="py-3 text-right">{staff.count}</td>
                          <td className="py-3 text-right font-medium">
                            {money(staff.amount, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {tab === "transactions" && (
            <section className="rounded-xl border border-white/10 p-4">
              <div className="mb-4 flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search description, vendor, staff..."
                    className="w-full rounded-lg border border-white/10 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#171717] px-3 py-2 text-sm"
                >
                  <option value="all">All categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {filteredExpenses.length === 0 ? (
                <EmptyState message="No matching expenses found." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="py-3">Date</th>
                        <th className="py-3">Description</th>
                        <th className="py-3">Category</th>
                        <th className="py-3">Vendor</th>
                        <th className="py-3">Recorded by</th>
                        <th className="py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses
                        .slice()
                        .sort((a, b) => {
                          const dateA = getExpenseDate(a)?.getTime() ?? 0;
                          const dateB = getExpenseDate(b)?.getTime() ?? 0;
                          return dateB - dateA;
                        })
                        .map((expense) => (
                          <tr
                            key={expense.id}
                            className="border-t border-white/10"
                          >
                            <td className="py-3 text-gray-400">
                              {getExpenseDate(expense)?.toLocaleDateString() ?? "—"}
                            </td>
                            <td className="max-w-[220px] py-3">
                              <div className="truncate">
                                {expense.title ||
                                  expense.description ||
                                  "No description"}
                              </div>
                              {isReimbursed(expense) && (
                                <span className="text-xs text-amber-400">
                                  Reimbursed
                                </span>
                              )}
                            </td>
                            <td className="py-3">{getCategory(expense)}</td>
                            <td className="py-3 text-gray-400">
                              {expense.vendorName ||
                                expense.vendorRef ||
                                "—"}
                            </td>
                            <td className="py-3">
                              {getRecorder(expense, staffNames)}
                            </td>
                            <td className="py-3 text-right font-medium">
                              {money(Number(expense.amount || 0), currency)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {tab === "insights" && (
            <section className="space-y-4">
              <div className="rounded-xl border border-white/10 p-4">
                <h2 className="font-semibold">Expenses requiring review</h2>
                <p className="mb-4 mt-1 text-sm text-gray-400">
                  These are review signals, not proof of fraud or misconduct.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-white/[0.04] p-3">
                    <p className="text-sm text-gray-400">Large expenses</p>
                    <p className="mt-1 text-xl font-semibold">
                      {insights.large.length}
                    </p>
                    <p className="text-xs text-gray-500">
                      Above twice the period's average (
                      {money(insights.largeThreshold, currency)})
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/[0.04] p-3">
                    <p className="text-sm text-gray-400">
                      Missing descriptions
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {insights.missingDescription.length}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/[0.04] p-3">
                    <p className="text-sm text-gray-400">
                      Missing vendor information
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {insights.missingVendor.length}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/[0.04] p-3">
                    <p className="text-sm text-gray-400">
                      Repeated expense groups
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {insights.repeatedCount}
                    </p>
                    <p className="text-xs text-gray-500">
                      Same category, vendor and amount appearing multiple times
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 p-4">
                <h3 className="mb-3 font-semibold">Large expenses to inspect</h3>
                {insights.large.length === 0 ? (
                  <EmptyState message="No expenses exceed the review threshold." />
                ) : (
                  <div className="space-y-3">
                    {insights.large
                      .slice()
                      .sort(
                        (a, b) =>
                          Number(b.amount) - Number(a.amount)
                      )
                      .map((expense) => (
                        <div
                          key={expense.id}
                          className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-sm"
                        >
                          <div>
                            <p>
                              {expense.title ||
                                expense.description ||
                                "No description"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getCategory(expense)} ·{" "}
                              {getRecorder(expense, staffNames)}
                            </p>
                          </div>
                          <strong>
                            {money(Number(expense.amount), currency)}
                          </strong>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
