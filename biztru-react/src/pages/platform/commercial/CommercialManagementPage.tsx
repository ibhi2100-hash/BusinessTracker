
import { useState } from "react";
import {
  CreditCard,
  Wallet,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassCard } from "../../../components/ui/GlassCard";
import { GlassIcon } from "../../../components/ui/GlassIcon";
import {
  commercialOverviewMock,
  commercialPlansMock,
  subscriptionsMock,
  invoicesMock,
} from "./data/commercial.mock";

import type {
  SubscriptionStatus,
} from "./types/commercial.type";

const money = (minor: number) =>
  `₦${(minor / 100).toLocaleString("en-NG")}`;

const statusStyles: Record<SubscriptionStatus, string> = {
  ACTIVE: "text-teal-400 bg-teal-400/10",
  PENDING: "text-sky-400 bg-sky-400/10",
  TRIAL: "text-violet-400 bg-violet-400/10",
  PAST_DUE: "text-rose-400 bg-rose-400/10",
  GRACE_PERIOD: "text-amber-400 bg-amber-400/10",
  CANCELLED: "text-white/40 bg-white/5",
  SUSPENDED: "text-rose-400 bg-rose-400/10",
};

export default function CommercialManagementPage() {
  const [tab, setTab] = useState<
    "subscriptions" | "plans" | "invoices"
  >("subscriptions");

  const overview = commercialOverviewMock;

  const metrics = [
    {
      label: "Monthly Recurring Revenue",
      value: money(overview.mrrMinor),
      icon: Wallet,
    },
    {
      label: "Annual Recurring Revenue",
      value: money(overview.arrMinor),
      icon: TrendingUp,
    },
    {
      label: "Active Subscriptions",
      value: overview.activeSubscriptions.toLocaleString(),
      icon: CreditCard,
    },
    {
      label: "Overdue Invoices",
      value: overview.overdueInvoices.toString(),
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">
          Commercial Control
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white">
          Billing & Subscriptions
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Manage BizTru plans, subscriptions and revenue.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <GlassCard key={metric.label} className="p-4">
            <div className="flex justify-between">
              <p className="text-xs text-white/45">
                {metric.label}
              </p>
              <GlassIcon icon={metric.icon} size="md" variant="success" />
            </div>
            <p className="mt-4 text-xl font-bold text-white">
              {metric.value}
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <GlassCard className="p-4">
          <p className="text-xs text-white/45">
            Collected revenue
          </p>
          <p className="mt-2 text-2xl font-bold text-teal-400">
            {money(overview.collectedMinor)}
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs text-white/45">
            Outstanding revenue
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-400">
            {money(overview.outstandingMinor)}
          </p>
        </GlassCard>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["subscriptions", "Subscriptions"],
          ["plans", "Plan Catalog"],
          ["invoices", "Invoices"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value as typeof tab)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === value
                ? "bg-teal-400/15 text-teal-300"
                : "border border-white/10 text-white/50 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "subscriptions" && (
        <GlassCard className="overflow-x-auto p-0">
          <div className="border-b border-white/[0.07] p-5">
            <h3 className="font-semibold text-white">
              Business Subscriptions
            </h3>
          </div>

          <table className="w-full min-w-[750px] text-left">
            <thead className="text-xs text-white/40">
              <tr>
                <th className="p-4">Business</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Cycle</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Renewal</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionsMock.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-t border-white/[0.05]"
                >
                  <td className="p-4 text-sm text-white">
                    {sub.businessName}
                  </td>
                  <td className="p-4 text-sm text-white/70">
                    {sub.planName} v{sub.planVersion}
                  </td>
                  <td className="p-4 text-sm text-white/60">
                    {sub.billingCycle}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {money(sub.priceMinor)}
                  </td>
                  <td className="p-4">
                    <span className={`rounded-lg px-2 py-1 text-xs ${statusStyles[sub.status]}`}>
                      {sub.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-white/50">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {tab === "plans" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {commercialPlansMock.map((plan) => (
            <GlassCard key={plan.id} className="p-5">
              <div className="flex items-center justify-between">
                <GlassIcon icon={Layers} size="lg" variant="primary" />
                <span className="text-xs text-teal-400">
                  v{plan.version}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold text-white">
                {plan.name}
              </h3>
              <p className="mt-1 min-h-10 text-xs text-white/45">
                {plan.description}
              </p>

              <p className="mt-5 text-2xl font-bold text-white">
                {money(plan.monthlyPriceMinor)}
                <span className="text-xs font-normal text-white/40">
                  /month
                </span>
              </p>

              <div className="mt-5 space-y-3 border-t border-white/[0.07] pt-4 text-xs text-white/60">
                <p>{plan.maxBranches} branches</p>
                <p>{plan.maxEmployeesPerBranch} employees per branch</p>
                <p>{plan.maxProductsPerBranch.toLocaleString()} products per branch</p>
                <p>{plan.subscriberCount} subscribers</p>
              </div>

              <div className="mt-5">
                <GlassButton
                  variant="secondary"
                  className="w-full"
                  disabled
                >
                  Plan configuration — next integration
                </GlassButton>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {tab === "invoices" && (
        <GlassCard className="overflow-x-auto p-0">
          <div className="border-b border-white/[0.07] p-5">
            <h3 className="font-semibold text-white">
              Invoice Registry
            </h3>
          </div>

          <table className="w-full min-w-[650px] text-left">
            <thead className="text-xs text-white/40">
              <tr>
                <th className="p-4">Invoice</th>
                <th className="p-4">Business</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due date</th>
              </tr>
            </thead>
            <tbody>
              {invoicesMock.map((invoice) => (
                <tr key={invoice.id} className="border-t border-white/[0.05]">
                  <td className="p-4 text-sm text-white">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="p-4 text-sm text-white/70">
                    {invoice.businessName}
                  </td>
                  <td className="p-4 text-sm text-white">
                    {money(invoice.amountMinor)}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs ${
                      invoice.status === "PAID"
                        ? "text-teal-400"
                        : invoice.status === "OVERDUE"
                          ? "text-rose-400"
                          : "text-amber-400"
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-white/50">
                    {new Date(invoice.dueAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}
